import path from 'path';
import { message } from 'antd';
import { promisify } from 'util';
import axios from 'axios';
import makeDir from 'make-dir';
import fse from 'fs-extra';
import { cpus } from 'os';
import dirTree from 'directory-tree';
import log from 'electron-log';
import Promise from 'bluebird';
import fs, { readdir, copyFile } from 'fs';
import compressing from 'compressing';
import { downloadFile, downloadArr } from '../utils/downloader';
import {
  PACKS_PATH,
  INSTANCES_PATH,
  META_PATH,
  GDL_LEGACYJAVAFIXER_MOD_URL
} from '../constants';
import vCompare from '../utils/versionsCompare';
import {
  extractAssets,
  extractMainJar,
  extractNatives,
  computeVanillaAndForgeLibraries
} from '../utils/getMCFilesList';
import { downloadMod, getModsList, createDoNotTouchFile } from '../utils/mods';
import { arraify } from '../utils/strings';
import { copyAssetsToLegacy, copyAssetsToResources } from '../utils/assets';
import { getAddonFile, getAddon } from '../utils/cursemeta';
import { DEFAULT_ARGS } from '../constants';

export const START_DOWNLOAD = 'START_DOWNLOAD';
export const CLEAR_QUEUE = 'CLEAR_QUEUE';
export const ADD_TO_QUEUE = 'ADD_TO_QUEUE';
export const DOWNLOAD_COMPLETED = 'DOWNLOAD_COMPLETED';
export const UPDATE_TOTAL_FILES_TO_DOWNLOAD = 'UPDATE_TOTAL_FILES_TO_DOWNLOAD';
export const UPDATE_PROGRESS = 'UPDATE_PROGRESS';

export function addToQueue(pack, version, forgeVersion = null) {
  return (dispatch, getState) => {
    const { downloadManager } = getState();
    dispatch({
      type: ADD_TO_QUEUE,
      payload: pack,
      version,
      forgeVersion
    });
    if (downloadManager.actualDownload === null) {
      dispatch({
        type: START_DOWNLOAD,
        payload: pack
      });
      dispatch(downloadPack(pack));
    }
  };
}

export function importTwitchProfile(pack, filePath) {
  return async (dispatch, getState) => {
    const { downloadManager } = getState();
    await compressing.zip.uncompress(
      filePath,
      path.join(INSTANCES_PATH, 'temp', pack)
    );
    const packInfo = JSON.parse(
      await promisify(fs.readFile)(
        path.join(INSTANCES_PATH, 'temp', pack, 'manifest.json')
      )
    );
    makeDir(path.join(PACKS_PATH, pack));
    const mcVersion = packInfo.minecraft.version;
    const addonID = packInfo.projectID;
    const forgeVersion = packInfo.minecraft.modLoaders[0].id.replace(
      'forge-',
      ''
    );
    dispatch({
      type: ADD_TO_QUEUE,
      payload: pack,
      version: mcVersion,
      forgeVersion,
      addonID
    });
    if (downloadManager.actualDownload === null) {
      dispatch({
        type: START_DOWNLOAD,
        payload: pack
      });
      dispatch(downloadPack(pack));
    }
  };
}

export function addCursePackToQueue(pack, addonID, fileID) {
  return async (dispatch, getState) => {
    const { downloadManager } = getState();
    const packURL = (await getAddonFile(addonID, fileID)).downloadUrl;
    const tempPackPath = path.join(
      INSTANCES_PATH,
      'temp',
      path.basename(packURL)
    );
    await downloadFile(tempPackPath, packURL, () => { });
    await compressing.zip.uncompress(
      tempPackPath,
      path.join(INSTANCES_PATH, 'temp', pack)
    );
    const packInfo = JSON.parse(
      await promisify(fs.readFile)(
        path.join(INSTANCES_PATH, 'temp', pack, 'manifest.json')
      )
    );
    makeDir(path.join(PACKS_PATH, pack));
    const mcVersion = packInfo.minecraft.version;
    const forgeVersion = packInfo.minecraft.modLoaders[0].id.replace(
      'forge-',
      ''
    );
    dispatch({
      type: ADD_TO_QUEUE,
      payload: pack,
      version: mcVersion,
      forgeVersion,
      addonID
    });
    if (downloadManager.actualDownload === null) {
      dispatch({
        type: START_DOWNLOAD,
        payload: pack
      });
      dispatch(downloadPack(pack));
    }
  };
}

export function clearQueue() {
  // This needs to clear any instance that is already installed
  return (dispatch, getState) => {
    const { downloadManager } = getState();
    const completed = Object.keys(downloadManager.downloadQueue).filter(
      act => downloadManager.downloadQueue[act].status === 'Completed'
    );
    // It makes no sense to dispatch if no instance is to remove
    if (completed.length !== 0) {
      dispatch({
        type: CLEAR_QUEUE,
        payload: completed
      });
    }
  };
}

export function downloadPack(pack) {
  return async (dispatch, getState) => {
    const { downloadManager, packCreator } = getState();
    const currPack = downloadManager.downloadQueue[pack];
    let vnlJSON = null;
    try {
      vnlJSON = JSON.parse(
        await promisify(fs.readFile)(
          path.join(
            META_PATH,
            'net.minecraft',
            currPack.version,
            `${currPack.version}.json`
          )
        )
      );
    } catch (err) {
      const versionURL = packCreator.versionsManifest.find(
        v => v.id === currPack.version
      ).url;
      vnlJSON = (await axios.get(versionURL)).data;
      await makeDir(path.join(META_PATH, 'net.minecraft', currPack.version));
      await promisify(fs.writeFile)(
        path.join(
          META_PATH,
          'net.minecraft',
          currPack.version,
          `${currPack.version}.json`
        ),
        JSON.stringify(vnlJSON)
      );
    }

    let forgeJSON = null;

    const assets = await extractAssets(vnlJSON, pack);
    const mainJar = await extractMainJar(vnlJSON);

    if (currPack.forgeVersion !== null) {
      try {
        forgeJSON = JSON.parse(
          await promisify(fs.readFile)(
            path.join(
              META_PATH,
              'net.minecraftforge',
              `forge-${currPack.forgeVersion}`,
              `forge-${currPack.forgeVersion}.json`
            )
          )
        );
        await promisify(fs.access)(
          path.join(
            INSTANCES_PATH,
            'libraries',
            ...arraify(forgeJSON.libraries[0].name)
          )
        );
      } catch (err) {
        const { data } = await axios.get(
          `https://addons-ecs.forgesvc.net/api/minecraft/modloader/forge-${
          currPack.forgeVersion
          }`
        );

        forgeJSON =
          JSON.parse(data.versionJson) || JSON.parse(data.additionalFilesJson);

        await downloadFile(
          path.join(
            INSTANCES_PATH,
            'libraries',
            ...arraify(forgeJSON.libraries[0].name)
          ),
          data.downloadUrl,
          p => {
            dispatch({
              type: UPDATE_PROGRESS,
              payload: { pack, percentage: ((p * 18) / 100).toFixed(0) }
            });
          }
        );

        await makeDir(
          path.dirname(
            path.join(
              INSTANCES_PATH,
              'libraries',
              ...arraify(forgeJSON.libraries[0].name)
            )
          )
        );
        await makeDir(
          path.join(
            META_PATH,
            'net.minecraftforge',
            `forge-${currPack.forgeVersion}`
          )
        );
        await promisify(fs.writeFile)(
          path.join(
            META_PATH,
            'net.minecraftforge',
            `forge-${currPack.forgeVersion}`,
            `forge-${currPack.forgeVersion}.json`
          ),
          JSON.stringify(forgeJSON)
        );
      }
    }

    const libraries = await computeVanillaAndForgeLibraries(vnlJSON, forgeJSON);

    // This is the main config file for the instance
    await makeDir(path.join(PACKS_PATH, pack));

    let thumbnailURL = null;

    if (currPack.addonID) {
      const addonRequest = await getAddon(currPack.addonID);
      thumbnailURL = addonRequest.attachments[0].thumbnailUrl;
    }

    // We download the legacy java fixer if needed
    const legacyJavaFixer =
      vCompare(currPack.forgeVersion, '10.13.1.1217') === -1
        ? {
          url: GDL_LEGACYJAVAFIXER_MOD_URL,
          path: path.join(PACKS_PATH, pack, 'mods', 'LJF.jar')
        }
        : null;

    // Here we work on the mods
    await createDoNotTouchFile(pack);

    let modsManifest = [];
    let overrideFilesList = [];
    let modpackVersion = null;
    try {
      const manifest = JSON.parse(
        await promisify(fs.readFile)(
          path.join(INSTANCES_PATH, 'temp', pack, 'manifest.json')
        )
      );
      modpackVersion = manifest.version;

      // Read every single file in the overrides folder
      const rreaddir = async (dir, allFiles = []) => {
        const files = (await promisify(readdir)(dir)).map(f =>
          path.join(dir, f)
        );
        allFiles.push(...files);
        await Promise.all(
          files.map(
            async f =>
              (await promisify(fs.stat)(f)).isDirectory() &&
              rreaddir(f, allFiles)
          )
        );
        return allFiles;
      };

      overrideFilesList = (await rreaddir(
        path.join(INSTANCES_PATH, 'temp', pack, 'overrides')
      )).map(f =>
        f.replace(path.join(INSTANCES_PATH, 'temp', pack, 'overrides'), '')
      );

      // Moves all the files inside the overrides folder to the instance folder
      const overrideFiles = await promisify(fs.readdir)(
        path.join(INSTANCES_PATH, 'temp', pack, 'overrides')
      );
      await Promise.all(
        overrideFiles.map(async item => {
          await fse.move(
            path.join(INSTANCES_PATH, 'temp', pack, 'overrides', item),
            path.join(PACKS_PATH, pack, item),
            { overwrite: true }
          );
        })
      );

      // Finally removes the entire temp folder
      await fse.remove(path.join(INSTANCES_PATH, 'temp'));

      let modsDownloaded = 0;
      await Promise.map(
        manifest.files,
        async mod => {
          modsDownloaded += 1;
          const modManifest = await downloadMod(
            mod.projectID,
            mod.fileID,
            null,
            pack
          );
          modsManifest = modsManifest.concat(modManifest);
          dispatch({
            type: UPDATE_PROGRESS,
            payload: {
              pack,
              percentage: (
                (modsDownloaded * 12) / manifest.files.length +
                18
              ).toFixed(0)
            }
          });
        },
        { concurrency: cpus().length + 2 }
      );
    } catch (err) {
      log.error(err);
    }

    if (thumbnailURL !== null) {
      // Download the thumbnail
      await downloadFile(
        path.join(PACKS_PATH, pack, 'thumbnail.png'),
        thumbnailURL,
        () => { }
      );

      // Copy the thumbnail as icon
      await promisify(copyFile)(
        path.join(PACKS_PATH, pack, 'thumbnail.png'),
        path.join(PACKS_PATH, pack, 'icon.png')
      );
    }

    await promisify(fs.writeFile)(
      path.join(PACKS_PATH, pack, 'config.json'),
      JSON.stringify({
        version: currPack.version,
        forgeVersion:
          currPack.forgeVersion === null
            ? null
            : `forge-${currPack.forgeVersion}`,
        ...(currPack.addonID && { projectID: currPack.addonID }),
        ...(modpackVersion && { modpackVersion }),
        ...(thumbnailURL && { icon: 'icon.png' }),
        timePlayed: 0,
        mods: modsManifest,
        overrideFiles: overrideFilesList,
        overrideArgs: DEFAULT_ARGS,
        overrideMemory: 3096
      })
    );

    const totalFiles = libraries.length + assets.length + mainJar.length;

    dispatch({
      type: UPDATE_TOTAL_FILES_TO_DOWNLOAD,
      payload: {
        pack,
        total: totalFiles
      }
    });

    const updatePercentage = downloaded => {
      const actPercentage = ((downloaded * 70) / totalFiles + 30).toFixed(0);
      if (currPack.percentage !== actPercentage)
        return dispatch({
          type: UPDATE_PROGRESS,
          payload: {
            pack,
            percentage: actPercentage
          }
        });
    };

    const allFiles =
      legacyJavaFixer !== null
        ? [...libraries, ...assets, ...mainJar, legacyJavaFixer]
        : [...libraries, ...assets, ...mainJar];

    await downloadArr(allFiles, updatePercentage, pack);

    if (vnlJSON.assets === 'legacy') {
      await copyAssetsToLegacy(assets);
    } else if (vnlJSON.assets === 'pre-1.6') {
      await copyAssetsToResources(assets);
    }
    await extractNatives(libraries.filter(lib => 'natives' in lib), pack);

    dispatch({
      type: DOWNLOAD_COMPLETED,
      payload: pack
    });
    message.success(`${pack} has been downloaded!`);
    dispatch(addNextPackToActualDownload());
  };
}

function addNextPackToActualDownload() {
  return (dispatch, getState) => {
    const { downloadManager } = getState();
    const queueArr = Object.keys(downloadManager.downloadQueue);
    queueArr.some(pack => {
      if (downloadManager.downloadQueue[pack].status !== 'Completed') {
        dispatch({
          type: START_DOWNLOAD,
          payload: pack
        });
        dispatch(downloadPack(pack));
        return true;
      }
      return false;
    });
  };
}
