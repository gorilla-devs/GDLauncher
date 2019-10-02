import { spawn, exec } from 'child_process';
import fss, { promises as fs } from 'fs';
import { message } from 'antd';
import axios from 'axios';
import os, { cpus } from 'os';
import cheerio from 'cheerio';
import _, { isEqual, unionBy } from 'lodash';
import compressing from 'compressing';
import Promise from 'bluebird';
import fse from 'fs-extra';
import log from 'electron-log';
import { promisify } from 'util';
import path from 'path';
import watch from 'node-watch';
import makeDir from 'make-dir';
import uuid from 'uuid/v1';
import { push } from 'connected-react-router';
import versionCompare from '../utils/versionsCompare';
import * as ActionTypes from './actionTypes';
import {
  minecraftLogin,
  minecraftCheckAccessToken,
  minecraftRefreshAccessToken,
  getAddon,
  getAddonFiles,
  getAddonFile
} from '../APIs';
import { updateJavaArguments } from './settings/actions';
import launchCommand from '../utils/MCLaunchCommand';
import {
  PACKS_PATH,
  NEWS_URL,
  GAME_VERSIONS_URL,
  FORGE_PROMOS,
  INSTANCES_PATH,
  META_PATH,
  GDL_LEGACYJAVAFIXER_MOD_URL,
  LINUX,
  DARWIN,
  WINDOWS
} from '../constants';
import { readConfig, updateConfig } from '../utils/instances';
import { getCurrentAccount } from '../utils/selectors';
import {
  extractAssets,
  extractMainJar,
  computeVanillaAndForgeLibraries,
  extractNatives
} from '../utils/getMCFilesList';
import {
  checkForgeMeta,
  checkForgeDownloaded,
  getForgeVersionJSON
} from '../utils/forgeHelpers';
import { getForgeFileIDFromAddonVersion } from '../utils';
import { arraify } from '../utils/strings';
import { downloadFile, downloadArr } from '../utils/downloader';
import { createDoNotTouchFile, downloadMod } from '../utils/mods';
import { copyAssetsToLegacy, copyAssetsToResources } from '../utils/assets';

export function initManifests() {
  return async dispatch => {
    const versions = (await axios.get(GAME_VERSIONS_URL)).data;
    dispatch({
      type: ActionTypes.UPDATE_VANILLA_MANIFEST,
      data: versions
    });
    const promos = (await axios.get(FORGE_PROMOS)).data;
    const forgeVersions = {};
    // Looping over vanilla versions, create a new entry in forge object
    // and add to it all correct versions
    versions.versions.forEach(v => {
      forgeVersions[v.id] = promos
        .filter(ver => {
          // Filter out all versions below 1.6.1 until we decide to support them
          if (versionCompare(v.id, '1.6.1') === -1) return false;
          return ver.gameVersion === v.id;
        })
        .map(ver => ver.name.replace('forge-', ''));
    });

    dispatch({
      type: ActionTypes.UPDATE_FORGE_MANIFEST,
      data: _.omitBy(forgeVersions, v => v.length === 0)
    });
  };
}

export function initNews() {
  return async (dispatch, getState) => {
    const {
      news,
      loading: { minecraftNews }
    } = getState();
    if (news.length === 0 && !minecraftNews.isRequesting) {
      try {
        const res = await axios.get(NEWS_URL);
        console.log(res);
        const newsArr = await Promise.all(
          res.data.article_grid.map(async item => {
            return {
              title: item.default_tile.title,
              description: item.default_tile.sub_header,
              // We need to get the header image of every article, since
              // the ones present in this json are thumbnails
              image: `https://minecraft.net${item.default_tile.image.imageURL}`,
              url: `https://minecraft.net${item.article_url}`
            };
          })
        );
        dispatch({
          type: ActionTypes.UPDATE_NEWS,
          news: newsArr.splice(0, 12)
        });
      } catch (err) {
        log.error(err.message);
      }
    }
  };
}

export function updateAccount(uuid, account) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_ACCOUNT,
      id: uuid,
      account
    });
    dispatch(updateCurrentAccountId(uuid));
  };
}

export function removeAccount(id) {
  return async (dispatch, getState) => {
    dispatch({
      type: ActionTypes.REMOVE_ACCOUNT,
      id
    });
    const { app } = getState();
    if (app.accounts.length > 0) {
      dispatch(updateCurrentAccountId(app.accounts[0].selectedProfile.id));
    } else {
      dispatch(updateCurrentAccountId(null));
    }
  };
}

export function updateIsNewUser(isNewUser) {
  return async dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_IS_NEW_USER,
      isNewUser
    });
  };
}

export function updateCurrentAccountId(id) {
  return async dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_CURRENT_ACCOUNT_ID,
      id
    });
  };
}

export function login(username, password, remember) {
  return async (dispatch, getState) => {
    const {
      app: { isNewUser, clientToken }
    } = getState();
    try {
      const { data, status } = await minecraftLogin(
        username,
        password,
        clientToken
      );
      if (status !== 200) throw new Error();
      dispatch(updateAccount(data.selectedProfile.id, data));

      if (!isNewUser) {
        dispatch(push('/home'));
      } else {
        dispatch(updateIsNewUser(false));
        dispatch(push('/newUserPage'));
      }
    } catch (err) {
      log.error(err);
      message.error('Wrong username or password');
      throw new Error();
    }
  };
}

export function loginWithAccessToken() {
  return async (dispatch, getState) => {
    const state = getState();
    const { accessToken, selectedProfile, clientToken } = getCurrentAccount(
      state
    );
    try {
      await minecraftCheckAccessToken(accessToken, clientToken);
      dispatch(push('/home'));
    } catch (error) {
      log.error(error);
      // Trying refreshing the stored access token
      if (error.response && error.response.status === 403) {
        try {
          const { data } = await minecraftRefreshAccessToken(
            accessToken,
            clientToken
          );
          dispatch(updateAccount(data.selectedProfile.id, data));
          dispatch(push('/home'));
        } catch (nestedError) {
          log.error(error, nestedError);
          message.error('Token Not Valid. You Need To Log-In Again :(');
          dispatch(removeAccount(selectedProfile.id));
          dispatch(push('/'));
          throw new Error();
        }
      } else if (error.message === 'Network Error') {
        message.info('You are offline. Logging in in offline-mode');
        dispatch(push('/home'));
      }
    }
  };
}

export function loginThroughNativeLauncher() {
  return async (dispatch, getState) => {
    const {
      app: { isNewUser }
    } = getState();

    const homedir = process.env.APPDATA || os.homedir();
    const vanillaMCPath = path.join(homedir, '.minecraft');
    const vnlJson = await fse.readJson(
      path.join(vanillaMCPath, 'launcher_profiles.json')
    );

    const { clientToken } = vnlJson;
    const { account } = vnlJson.selectedUser;
    const { accessToken } = vnlJson.authenticationDatabase[account];
    try {
      const { data } = await minecraftRefreshAccessToken(
        accessToken,
        clientToken
      );

      // We need to update the accessToken in launcher_profiles.json
      vnlJson.authenticationDatabase[data.selectedProfile.userId].accessToken =
        data.accessToken;
      await fse.writeJson(
        path.join(vanillaMCPath, 'launcher_profiles.json'),
        vnlJson
      );

      dispatch(updateAccount(data.selectedProfile.id, data));

      if (isNewUser) {
        dispatch(updateIsNewUser(false));
        dispatch(push('/newUserPage'));
      } else {
        dispatch(push('/home'));
      }
    } catch (err) {
      message.error(
        'We could not log you in through Minecraft Launcher. Invalid data.'
      );
      console.error(err);
      throw new Error();
    }
  };
}

export function logout() {
  return (dispatch, getState) => {
    const state = getState();
    const { id } = getCurrentAccount(state).selectedProfile;
    dispatch(removeAccount(id));
    dispatch(push('/'));
  };
}

export function checkClientToken() {
  return (dispatch, getState) => {
    const {
      app: { clientToken }
    } = getState();
    if (clientToken) return clientToken;
    const newToken = uuid()
      .split('')
      .filter(v => v !== '-')
      .join('');
    dispatch({
      type: ActionTypes.UPDATE_CLIENT_TOKEN,
      clientToken: newToken
    });
    return newToken;
  };
}

export function updateModsManifests(modManifest) {
  return (dispatch, getState) => {
    const {
      app: { modsManifests }
    } = getState();
    if (!modsManifests.find(v => v.projectID === modManifest.projectID)) {
      dispatch({
        type: ActionTypes.UPDATE_MODS_MANIFESTS,
        id: modManifest.projectID,
        modManifest
      });
    }
  };
}

export function removeModsManifests(id) {
  return dispatch => {
    dispatch({
      type: ActionTypes.REMOVE_MOD_MANIFEST,
      id
    });
  };
}

export function updateSelectedInstance(name) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_SELECTED_INSTANCE,
      name
    });
  };
}

export function startInstance(instanceName) {
  return async (dispatch, getState) => {
    const state = getState();
    const {
      settings: {
        java: { args }
      }
    } = state;

    const account = getCurrentAccount(state);

    // Checks for legacy java memory
    const legacyString = [' -Xmx{_RAM_}m', '-Xmx{_RAM_}m'];
    let config = await readConfig(instanceName);
    if (
      config.overrideArgs &&
      (config.overrideArgs.includes(legacyString[0]) ||
        config.overrideArgs.includes(legacyString[1]))
    ) {
      await updateConfig(instanceName, {
        overrideArgs: config.overrideArgs.replace(legacyString, '')
      });
    }

    if (args.includes(legacyString[0]))
      dispatch(updateJavaArguments(args.replace(legacyString[0], '')));
    if (args.includes(legacyString[1]))
      dispatch(updateJavaArguments(args.replace(legacyString[1], '')));

    const command = await launchCommand(instanceName, account, state.settings);

    const start = spawn(command, [], {
      shell: true,
      cwd: path.join(PACKS_PATH, instanceName)
    });

    let minutes = 0;
    const timer = setInterval(() => {
      minutes += 1;
    }, 60000);

    start.stdout.on('data', data => {
      console.log(data.toString());
    });

    start.stderr.on('data', data => {
      log.error(data.toString());
    });

    dispatch({
      type: ActionTypes.ADD_STARTED_INSTANCE,
      name: instanceName,
      pid: start.pid
    });

    start.on('exit', async () => {
      clearInterval(timer);
      dispatch({
        type: ActionTypes.REMOVE_STARTED_INSTANCE,
        name: instanceName
      });
      config = await readConfig(instanceName);
      await updateConfig(instanceName, {
        timePlayed: config.timePlayed ? config.timePlayed + minutes : minutes
      });
    });
    start.on('error', err => {
      message.error('There was an error while starting the instance');
      log.error(err);
    });
  };
}

export function initInstances() {
  return async (dispatch, getState) => {
    let watcher;
    const isDirectory = source => fss.lstatSync(source).isDirectory();

    const getDirectories = async source => {
      const dirs = await fs.readdir(source);
      return dirs
        .map(name => path.join(source, name))
        .filter(isDirectory)
        .map(dir => path.basename(dir));
    };

    const getInstances = async () => {
      let mappedInstances = [];
      try {
        const instances = await getDirectories(PACKS_PATH);
        mappedInstances = await Promise.all(
          instances.map(async instance => {
            let mods = [];
            let projectID = null;
            try {
              const config = await readConfig(instance);
              projectID = config.projectID;
              if (
                config.mods &&
                Array.isArray(config.mods) &&
                config.mods.length
              ) {
                try {
                  mods = (await fs.readdir(
                    path.join(PACKS_PATH, instance, 'mods')
                  ))
                    .filter(
                      el =>
                        path.extname(el) === '.zip' ||
                        path.extname(el) === '.jar' ||
                        path.extname(el) === '.disabled'
                    )
                    .map(mod => {
                      const configMod = config.mods.find(
                        v => v.fileName === mod
                      );
                      if (configMod) return configMod;
                      return { fileName: mod };
                    });
                } catch (err) {
                  console.error("Failed to get instance's mods", err);
                }
              }
            } catch (err) {
              console.error("Failed to get instance's config", err);
            }
            return {
              name: instance,
              ...(projectID && { projectID }),
              mods
            };
          })
        );
      } catch (err) {
        console.error('Failed to get instances', err);
      }
      return mappedInstances;
    };

    const watchRoutine = async () => {
      try {
        await fs.access(PACKS_PATH);
      } catch (e) {
        await makeDir(PACKS_PATH);
      }
      let instances = await getInstances();
      dispatch({
        type: ActionTypes.UPDATE_INSTANCES,
        instances
      });

      const updateInstances = async () => {
        instances = await getInstances();
        const { instances: stateInstances } = getState();
        if (!isEqual(stateInstances, instances)) {
          dispatch({
            type: ActionTypes.UPDATE_INSTANCES,
            instances
          });
        }
      };

      const getInstancesDebounced = _.debounce(updateInstances, 100);

      // Watches for any changes in the packs dir. TODO: Optimize
      watcher = watch(PACKS_PATH, { recursive: true }, async () => {
        try {
          await fs.access(PACKS_PATH);
        } catch (e) {
          await makeDir(PACKS_PATH);
        }
        getInstancesDebounced();
      });
      watcher.on('error', async () => {
        try {
          await fs.access(PACKS_PATH);
        } catch (e) {
          await makeDir(PACKS_PATH);
        } finally {
          watchRoutine();
        }
      });
    };

    watchRoutine();
  };
}

export function removeDownloadFromQueue(name) {
  return dispatch => {
    dispatch({
      type: ActionTypes.REMOVE_DOWNLOAD_FROM_QUEUE,
      name
    });
  };
}

export function createInstance(version, packName, forgeVersion = null) {
  return async dispatch => {
    await makeDir(path.join(PACKS_PATH, packName));
    await dispatch(addToQueue(packName, version, forgeVersion));
  };
}

export function instanceDownloadOverride(
  version,
  packName,
  forgeVersion = null
) {
  return async dispatch => {
    try {
      await fs.access(path.join(PACKS_PATH, packName));
    } catch (e) {
      await makeDir(path.join(PACKS_PATH, packName));
    } finally {
      await dispatch(addToQueue(packName, version, forgeVersion));
    }
  };
}

export function updateCurrentDownload(name) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_CURRENT_DOWNLOAD,
      name
    });
  };
}

export function updateDownloadProgress(min, percDifference, computed, total) {
  return (dispatch, getState) => {
    const { currentDownload } = getState();
    const actualPercentage = (computed * percDifference) / total;
    dispatch({
      type: ActionTypes.UPDATE_DOWNLOAD_PROGRESS,
      name: currentDownload,
      percentage: Number(actualPercentage.toFixed()) + Number(min)
    });
  };
}

export function repairInstance(name) {
  return async dispatch => {
    dispatch({
      type: ActionTypes.ADD_DOWNLOAD_TO_QUEUE,
      name
    });
    const config = await readConfig(name);
    if (config.projectID) {
      const files = await getAddonFiles(config.projectID);
      const fileID = await getForgeFileIDFromAddonVersion(
        files,
        config.modpackVersion
      );
      if (fileID)
        dispatch(addTwitchModpackToQueue(name, config.projectID, fileID, true));
      else {
        dispatch({
          type: ActionTypes.REMOVE_DOWNLOAD_FROM_QUEUE,
          name
        });
        message.error('Could not repair');
        log.error(
          'Could not find fileID for',
          name,
          config.projectID,
          config.modpackVersion
        );
      }
    } else {
      dispatch(
        addToQueue(
          name,
          config.version,
          config.forgeVersion
            ? config.forgeVersion.replace('forge-', '')
            : null,
          true
        )
      );
    }
  };
}

export function addToQueue(
  name,
  version,
  forgeVersion = null,
  isRepair = false
) {
  return (dispatch, getState) => {
    const { currentDownload } = getState();
    dispatch({
      type: ActionTypes.ADD_DOWNLOAD_TO_QUEUE,
      name,
      version,
      forgeVersion
    });
    if (!currentDownload) {
      dispatch(updateCurrentDownload(name));
      dispatch(downloadInstance(name, isRepair));
    }
  };
}

export function importInstanceFromTwitch(name, filePath) {
  return async (dispatch, getState) => {
    const { currentDownload } = getState();
    await compressing.zip.uncompress(
      filePath,
      path.join(INSTANCES_PATH, 'temp', name)
    );
    const packInfo = JSON.parse(
      await fs.readFile(
        path.join(INSTANCES_PATH, 'temp', name, 'manifest.json')
      )
    );
    makeDir(path.join(PACKS_PATH, name));
    const mcVersion = packInfo.minecraft.version;
    const addonID = packInfo.projectID;
    const forgeVersion = packInfo.minecraft.modLoaders[0].id.replace(
      'forge-',
      ''
    );
    dispatch({
      type: ActionTypes.ADD_DOWNLOAD_TO_QUEUE,
      name,
      version: mcVersion,
      forgeVersion,
      addonID
    });
    if (!currentDownload) {
      dispatch(updateCurrentDownload(name));
      dispatch(downloadInstance(name));
    }
  };
}

export function addTwitchModpackToQueue(
  name,
  addonID,
  fileID,
  isRepair = false
) {
  return async (dispatch, getState) => {
    const { currentDownload } = getState();
    const packURL = (await getAddonFile(addonID, fileID)).downloadUrl;
    const tempPackPath = path.join(
      INSTANCES_PATH,
      'temp',
      path.basename(packURL)
    );
    await downloadFile(tempPackPath, packURL, () => {});
    await compressing.zip.uncompress(
      tempPackPath,
      path.join(INSTANCES_PATH, 'temp', name)
    );
    const packInfo = JSON.parse(
      await fs.readFile(
        path.join(INSTANCES_PATH, 'temp', name, 'manifest.json')
      )
    );
    makeDir(path.join(PACKS_PATH, name));
    const mcVersion = packInfo.minecraft.version;
    const forgeVersion = packInfo.minecraft.modLoaders[0].id.replace(
      // Handle legacy launcher versions
      'forge-',
      ''
    );

    dispatch({
      type: ActionTypes.ADD_DOWNLOAD_TO_QUEUE,
      name,
      version: mcVersion,
      forgeVersion,
      addonID
    });
    if (!currentDownload) {
      dispatch(updateCurrentDownload(name));
      dispatch(downloadInstance(name, isRepair));
    }
  };
}

export function downloadInstance(pack, isRepair = false) {
  return async (dispatch, getState) => {
    const {
      downloadQueue,
      currentDownload,
      app: {
        vanillaManifest: { versions: vnlVersions }
      }
    } = getState();
    const currPack = downloadQueue[currentDownload];
    let vnlJSON = null;
    try {
      // If is repair, skip this and download it again
      if (isRepair) throw new Error();
      vnlJSON = JSON.parse(
        await fs.readFile(
          path.join(
            INSTANCES_PATH,
            'versions',
            currPack.version,
            `${currPack.version}.json`
          )
        )
      );
    } catch (err) {
      const versionURL = vnlVersions.find(v => v.id === currPack.version).url;
      vnlJSON = (await axios.get(versionURL)).data;
      await makeDir(path.join(INSTANCES_PATH, 'versions', currPack.version));
      await fs.writeFile(
        path.join(
          INSTANCES_PATH,
          'versions',
          currPack.version,
          `${currPack.version}.json`
        ),
        JSON.stringify(vnlJSON)
      );
    }

    let forgeJSON = null;

    const assets = await extractAssets(vnlJSON, pack);
    const mainJar = await extractMainJar(vnlJSON);

    if (currPack.forgeVersion) {
      try {
        // If is repair, skip this and download it again
        if (isRepair) throw new Error();
        forgeJSON = await checkForgeMeta(currPack.forgeVersion);
        await checkForgeDownloaded(forgeJSON.mavenVersionString);
      } catch (err) {
        forgeJSON = await getForgeVersionJSON(currPack.forgeVersion);
        const forgeBinPath = path.join(
          INSTANCES_PATH,
          'libraries',
          ...arraify(forgeJSON.mavenVersionString)
        );

        await downloadFile(forgeBinPath, forgeJSON.downloadUrl, p => {
          dispatch(updateDownloadProgress(0, 15, p, 100));
        });

        await fse.outputFile(
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

    const libraries = await computeVanillaAndForgeLibraries(
      vnlJSON,
      forgeJSON,
      false
    );

    // This is the main config file for the instance
    await makeDir(path.join(PACKS_PATH, pack));

    let thumbnailURL = null;

    if (currPack.addonID) {
      const addonRequest = await getAddon(currPack.addonID);
      thumbnailURL = addonRequest.attachments[0].thumbnailUrl;
    }

    // We download the legacy java fixer if needed
    const legacyJavaFixer =
      versionCompare(currPack.forgeVersion, '10.13.1.1217') === -1
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
        await fs.readFile(
          path.join(INSTANCES_PATH, 'temp', pack, 'manifest.json')
        )
      );
      modpackVersion = manifest.version;

      // Read every single file in the overrides folder
      const rreaddir = async (dir, allFiles = []) => {
        const files = (await fs.readdir(dir)).map(f => path.join(dir, f));
        allFiles.push(...files);
        await Promise.all(
          files.map(
            async f => (await fs.stat(f)).isDirectory() && rreaddir(f, allFiles)
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
      const overrideFiles = await fs.readdir(
        path.join(INSTANCES_PATH, 'temp', pack, 'overrides')
      );
      await Promise.all(
        overrideFiles.map(async item => {
          await fse.copy(
            path.join(INSTANCES_PATH, 'temp', pack, 'overrides', item),
            path.join(PACKS_PATH, pack, item),
            { overwrite: true }
          );
        })
      );

      let modsDownloaded = 0;
      await Promise.map(
        manifest.files,
        async mod => {
          modsDownloaded += 1;
          const modManifest = await downloadMod(
            mod.projectID,
            mod.fileID,
            null,
            pack,
            true
          );
          modsManifest = modsManifest.concat(modManifest);
          dispatch(
            updateDownloadProgress(
              15,
              15,
              modsDownloaded,
              manifest.files.length
            )
          );
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
        () => {}
      );

      // Copy the thumbnail as icon
      await fs.copyFile(
        path.join(PACKS_PATH, pack, 'thumbnail.png'),
        path.join(PACKS_PATH, pack, 'icon.png')
      );
    }

    let timePlayed = 0;
    let mods = modsManifest;

    // If it's repairing (also switching modpack version), try to keep played time
    if (isRepair) {
      try {
        const prevConfig = await readConfig(pack);
        mods = unionBy(modsManifest, prevConfig.mods, 'projectID');
        timePlayed = prevConfig.timePlayed;
      } catch {
        console.error('Could not find a valid config - using defaults');
      }
    }

    await fs.writeFile(
      path.join(PACKS_PATH, pack, 'config.json'),
      JSON.stringify({
        version: currPack.version,
        forgeVersion: currPack.forgeVersion && `forge-${currPack.forgeVersion}`,
        ...(currPack.addonID && { projectID: currPack.addonID }),
        ...(modpackVersion && { modpackVersion }),
        ...(thumbnailURL && { icon: 'icon.png' }),
        timePlayed,
        mods,
        overrideFiles: overrideFilesList
      })
    );

    const totalFiles = libraries.length + assets.length + mainJar.length;

    dispatch({
      type: ActionTypes.UPDATE_TOTAL_FILES_TO_DOWNLOAD,
      payload: {
        pack,
        total: totalFiles
      }
    });

    // Check if needs 1.13 forge patching
    const installProfileJson =
      forgeJSON && JSON.parse(forgeJSON.installProfileJson);

    let totalPercentage = 100;
    let minPercentage = 0;

    if (currPack.forgeVersion) {
      if (modsManifest.length) {
        minPercentage = 30;
        totalPercentage = 60;
      } else {
        minPercentage = 15;
        totalPercentage = 85;
      }

      if (installProfileJson) {
        totalPercentage -= 10;
      }
    }
    const updatePercentage = downloaded => {
      dispatch(
        updateDownloadProgress(
          minPercentage,
          totalPercentage,
          downloaded,
          totalFiles
        )
      );
    };

    const allFiles =
      legacyJavaFixer !== null
        ? [...libraries, ...assets, ...mainJar, legacyJavaFixer]
        : [...libraries, ...assets, ...mainJar];

    await downloadArr(allFiles, updatePercentage, pack, isRepair);

    if (vnlJSON.assets === 'legacy') {
      await copyAssetsToLegacy(assets);
    } else if (vnlJSON.assets === 'pre-1.6') {
      await copyAssetsToResources(assets);
    }
    await extractNatives(libraries.filter(lib => 'natives' in lib), pack);

    // Finish forge patches >= 1.13
    if (installProfileJson) {
      const { processors } = installProfileJson;
      const replaceIfPossible = arg => {
        const finalArg = arg.replace('{', '').replace('}', '');
        if (installProfileJson.data[finalArg]) {
          // Handle special case
          if (finalArg === 'BINPATCH') {
            return path
              .join(
                INSTANCES_PATH,
                'libraries',
                ...arraify(installProfileJson.path)
              )
              .replace('.jar', '-clientdata.lzma');
          }
          // Return replaced string
          return installProfileJson.data[finalArg].client;
        }
        // Return original string (checking for MINECRAFT_JAR)
        return arg.replace('{MINECRAFT_JAR}', mainJar[0].path);
      };
      const computePathIfPossible = arg => {
        if (arg[0] === '[') {
          return `"${path.join(
            INSTANCES_PATH,
            'libraries',
            arraify(arg.replace('[', '').replace(']', '')).join('/')
          )}"`;
        }
        return arg;
      };
      const javaPath = await dispatch(getJavaPath());
      let i = 0;
      for (const p in processors) {
        i += 1;
        const filePath = path.join(
          INSTANCES_PATH,
          'libraries',
          ...arraify(processors[p].jar)
        );
        const args = processors[p].args
          .map(arg => replaceIfPossible(arg))
          .map(arg => computePathIfPossible(arg));

        const classPaths = processors[p].classpath.map(cp =>
          path.join(INSTANCES_PATH, 'libraries', arraify(cp).join('/'))
        );

        const jarFile = await promisify(jarAnalyzer.fetchJarAtPath)(filePath);
        const mainClass = jarFile.valueForManifestEntry('Main-Class');

        const { stderr, stdout } = await promisify(exec)(
          `"${javaPath}" -classpath "${filePath}${CLASSPATH_DIVIDER_CHAR}${classPaths.join(
            CLASSPATH_DIVIDER_CHAR
          )}" ${mainClass} ${args.join(' ')}`,
          { maxBuffer: 10000000000 }
        );

        log.error(stderr);
        dispatch(updateDownloadProgress(90, 10, i, processors.length));
      }
    }
    dispatch({
      type: ActionTypes.UPDATE_DOWNLOAD_PROGRESS,
      name: pack,
      percentage: 100
    });
    dispatch(removeDownloadFromQueue(pack));
    message.success(`${pack} has been downloaded!`);
    dispatch(addNextInstanceToCurrentDownload());
  };
}

function addNextInstanceToCurrentDownload() {
  return (dispatch, getState) => {
    const { downloadQueue } = getState();
    const queueArr = Object.keys(downloadQueue);
    if (queueArr.length > 0) {
      const nextDownload = downloadQueue[queueArr[0]].name;
      dispatch(updateCurrentDownload(nextDownload));
      dispatch(downloadInstance(nextDownload));
    }
  };
}

export function getJavaPath() {
  return async (dispatch, getState) => {
    const {
      settings: { java }
    } = getState();

    if (!java.path) {
      let command = null;
      switch (os.platform()) {
        case LINUX:
        case DARWIN:
          command = 'which java';
          break;
        case WINDOWS:
          command = 'where java';
          break;
        default:
          break;
      }
      try {
        const { stdout } = await promisify(exec)(command);
        // This returns the first path found
        return stdout.split('\n')[0];
      } catch (e) {
        log.info(`Could not find java path: ${e.message}`);
        return null;
      }
    }
    return Promise.resolve(java.path);
  };
}

export function updateModpacksFilter(filter) {
  return {
    type: ActionTypes.UPDATE_MODPACKS_FILTER,
    filter
  };
}

export function updateModpacksSearch(search) {
  return {
    type: ActionTypes.UPDATE_MODPACKS_FILTER,
    search
  };
}

export function loadMoreModpacks() {
  return (dispatch, getState) => {};
}
