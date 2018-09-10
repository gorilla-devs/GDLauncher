import path from 'path';
import { remote, ipcRenderer } from 'electron';
import { message } from 'antd';
import { APPPATH, PACKS_PATH, INSTANCES_PATH, MAVEN_REPO } from '../constants';
import { promisify } from 'util';
import axios from 'axios';
import request from 'request';
import makeDir from 'make-dir';
import fs from 'fs';
import zip from 'adm-zip';
import { downloadFile } from '../utils/downloader';
//Getting colors from scss theme file
import colors from '../style/theme/index.scss';

export const START_DOWNLOAD = 'START_DOWNLOAD';
export const CLEAR_QUEUE = 'CLEAR_QUEUE';
export const ADD_TO_QUEUE = 'ADD_TO_QUEUE';
export const DOWNLOAD_COMPLETED = 'DOWNLOAD_COMPLETED';
export const DOWNLOAD_FILE_COMPLETED = 'DOWNLOAD_FILE_COMPLETED';
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

export function clearQueue() {
  // This needs to clear any instance that is already installed
  return (dispatch, getState) => {
    const { downloadManager } = getState();
    const completed = Object.keys(downloadManager.downloadQueue).filter(act => downloadManager.downloadQueue[act].status === 'Completed');
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
    const { downloadManager } = getState();
    console.log(`%cDownloading ${pack}`, `color: ${colors.primary}`);

    const vnlHelpers = require('../utils/getMCFilesList');
    const downloader = require('../utils/downloader');

    const vnlPath = path.join(PACKS_PATH, pack, 'vnl.json');
    const vnlRead = await promisify(fs.readFile)(vnlPath);
    const vnlJSON = JSON.parse(vnlRead);

    const vnlLibs = await vnlHelpers.extractLibs(vnlJSON);

    const vnlAssets = await vnlHelpers.extractAssets(vnlJSON);

    const mainJar = await vnlHelpers.extractMainJar(vnlJSON);

    let forgeLibs = null;

    if (downloadManager.downloadQueue[pack].forgeVersion !== null) {
      const forge = downloadManager.downloadQueue[pack].forgeVersion;
      const version = downloadManager.downloadQueue[pack].version;
      let forgeFileName = `${version}-${forge}`;
      const forgeUrl = `https://files.minecraftforge.net/maven/net/minecraftforge/forge/${forgeFileName}/forge-${forgeFileName}-installer.jar`;
      // Checks whether the filename is version-forge or version-forge-version
      try {
        await axios.head(forgeUrl);
      } catch (err) {
        forgeFileName = `${version}-${forge}-${version}-`;
      } finally {
        await dlFile(path.join(PACKS_PATH, pack, 'forge-installer.jar'), forgeUrl, (p) => {
          dispatch({ type: UPDATE_PROGRESS, payload: { pack, percentage: p } });
        });
        // First let's extract the profile json from the installer
        const zipFile = new zip(path.join(PACKS_PATH, pack, 'forge-installer.jar'));
        await promisify(fs.writeFile)(path.join(PACKS_PATH, pack, 'forge.json'), zipFile.readAsText("install_profile.json"));
        const IProfile = JSON.parse(await promisify(fs.readFile)(path.join(PACKS_PATH, pack, 'forge.json')));
        // Now let's extract the main forge universal file and save it in the correct place
        // THIS IS MAGIC ----> DO NOT TOUCH THE FOLLOWING LINES, YOU WON'T COME BACK HOME
        // It transforms a string like this: net.minecraftforge:forge:1.9.4-12.17.0.1909-1.9.4 into an array of paths that path.join can work with
        const pathSplit = IProfile.install.path.split(':');
        const initPath = pathSplit[0].split('.').concat(pathSplit[1]).concat(pathSplit[2]).concat(`${pathSplit[1]}-${pathSplit[2]}.jar`);
        const forgePath = path.join(INSTANCES_PATH, 'libraries', ...initPath);
        // It creates the directory where the file is gonna go (if it doesn't already exists)
        try {
          await promisify(fs.access)(path.dirname(forgePath));
        } catch (e) {
          await makeDir(path.dirname(forgePath));
          try {
            await promisify(fs.access)(forgePath);
          } catch (err1) {
            await promisify(fs.writeFile)(forgePath, zipFile.readFile(IProfile.install.filePath));
          }
        }
        // At the end, we just remove the forge installer
        await promisify(fs.unlink)(path.join(PACKS_PATH, pack, 'forge-installer.jar'));
        forgeLibs = await vnlHelpers.extractForgeLibraries(IProfile);
      }
    }

    dispatch({
      type: UPDATE_TOTAL_FILES_TO_DOWNLOAD,
      payload: {
        pack,
        total: vnlLibs.length + vnlAssets.length + mainJar.length + (forgeLibs !== null ? forgeLibs.length : 0)
      }
    });

    await downloader.downloadArr(vnlLibs, path.join(INSTANCES_PATH, 'libraries'), dispatch, pack);

    if (forgeLibs !== null) {
      await downloader.downloadArr(forgeLibs, path.join(INSTANCES_PATH, 'libraries'), dispatch, pack);
    }

    await downloader.downloadArr(vnlAssets, path.join(INSTANCES_PATH, 'assets'), dispatch, pack, 10);

    await downloader.downloadArr(mainJar, path.join(INSTANCES_PATH, 'versions'), dispatch, pack);

    await vnlHelpers.extractNatives(vnlLibs.filter(lib => 'natives' in lib), pack);

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
      if (!downloadManager.downloadQueue[pack].status === 'Completed') {
        dispatch({
          type: START_DOWNLOAD,
          payload: pack
        });
        dispatch(downloadPack(pack));
        return true;
      }
    });
  };
}

function dlFile(filename, url, onProgress) {
  return new Promise((resolve, reject) => {
    // Save variable to know progress
    var received_bytes = 0;
    var total_bytes = 0;

    var req = request({
      method: 'GET',
      uri: url,
    });

    var out = fs.createWriteStream(filename);
    req.pipe(out);

    req.on('response', function (data) {
      // Change the total bytes value to get progress later.
      total_bytes = parseInt(data.headers['content-length']);
    });

    req.on('data', function (chunk) {
      // Update the received bytes
      received_bytes += chunk.length;
      onProgress(((received_bytes * 18) / total_bytes).toFixed(1));
    });

    req.on('end', function () {
      resolve();
    });

    req.on('error', () => {
      reject();
    })
  });
}