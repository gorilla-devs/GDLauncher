import * as path from 'path';
import { remote, ipcRenderer } from 'electron';
import { message } from 'antd';
import { APPPATH } from '../constants';
import { promisify } from 'util';


export const START_DOWNLOAD = 'START_DOWNLOAD';
export const CLEAR_QUEUE = 'CLEAR_QUEUE';
export const ADD_TO_QUEUE = 'ADD_TO_QUEUE';
export const DOWNLOAD_COMPLETED = 'DOWNLOAD_COMPLETED';
export const DOWNLOAD_FILE_COMPLETED = 'DOWNLOAD_FILE_COMPLETED';
export const UPDATE_TOTAL_FILES_TO_DOWNLOAD = 'UPDATE_TOTAL_FILES_TO_DOWNLOAD';

export function addToQueue(pack, packType) {
  return (dispatch, getState) => {
    const { downloadManager } = getState();
    dispatch({
      type: ADD_TO_QUEUE,
      payload: pack,
      packType
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
    const completed = Object.keys(downloadManager.downloadQueue).filter(act => downloadManager.downloadQueue[act].downloadCompleted);
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
    /*
    // We pass the name of the instance to the worker and then let the fork do all the work
    // The fork will keep the ui updated through forked.on.
    // UPDATE__FILES -> Adds 1 to the actual downloaded files
    // UPDATE__TOTAL -> Updates the total files to download
    // DOWNLOAD__COMPLETED -> Updates the actual state and sets it to downloaded
    // CLG_PIPE -> Sends a console.log command
    // CER_PIPE -> Sends a console.err command
    */

    // const { fork } = require('child_process');
    // console.log(`%cDownloading ${pack}`, 'color: #3498db');
    // const forked = fork(
    //   process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true' ?
    //     `${__dirname}/workers/downloadPackage.js` :
    //     path.join(remote.app.getAppPath(), 'dist/downloadPackage.js'
    //     ), {
    //     env: {
    //       name: downloadManager.downloadQueue[pack].name,
    //       appPath: APPPATH
    //     }
    //   }, {
    //     silent: true
    //   });


    // forked.on('message', (data) => {
    //   const { total, action } = data;
    //   switch (action) {
    //     case 'UPDATE__FILES':

    //       dispatch({
    //         type: DOWNLOAD_FILE_COMPLETED,
    //         payload: {
    //           pack
    //         }
    //       });
    //       break;
    //     case 'UPDATE__TOTAL':
    //       dispatch({
    //         type: UPDATE_TOTAL_FILES_TO_DOWNLOAD,
    //         payload: {
    //           pack,
    //           total
    //         }
    //       });
    //       break;
    //     case 'DOWNLOAD__COMPLETED':
    //       dispatch({
    //         type: DOWNLOAD_COMPLETED,
    //         payload: pack
    //       });
    //       message.success(`${pack} has been downloaded!`);

    //       forked.kill();
    //       // CHECK IF ANY ITEM EXISTS IN THE QUEUE YET TO BE DOWNLOADED.
    //       // IF YES, ADD IT TO THE ACTUALDOWNLOAD
    //       dispatch(addNextPackToActualDownload());
    //       break;
    //     case 'CLG_PIPE':
    //       console.log(data.msg);
    //       break;
    //     case 'CER_PIPE':
    //       console.error(data.msg);
    //       break;
    //     default:
    //       break;
    //   }
    // });

    const fs = require('fs');
    const constants = require('../constants');
    const vnlHelpers = require('../utils/getMCFilesList');
    const downloader = require('../workers/common/downloader');

    const vnlPath = path.join(APPPATH, constants.LAUNCHER_FOLDER, constants.PACKS_FOLDER_NAME, pack);
    const vnlRead = await promisify(fs.readFile)(`${vnlPath}/vnl.json`);
    const vnlJSON = JSON.parse(vnlRead);

    const vnlLibs = await vnlHelpers.extractLibs(vnlJSON);

    const vnlAssets = await vnlHelpers.extractAssets(vnlJSON);

    const mainJar = await vnlHelpers.extractMainJar(vnlJSON);

    dispatch({
      type: UPDATE_TOTAL_FILES_TO_DOWNLOAD,
      payload: {
        pack,
        total: vnlLibs.length + vnlAssets.length + mainJar.length
      }
    });

    await downloader.downloadArr(vnlLibs, path.join(APPPATH, constants.LAUNCHER_FOLDER, 'libraries'));

    await downloader.downloadArr(vnlAssets, path.join(APPPATH, constants.LAUNCHER_FOLDER, 'assets'), 10);

    await downloader.downloadArr(mainJar, path.join(APPPATH, constants.LAUNCHER_FOLDER, 'versions'));

    await vnlHelpers.extractNatives(vnlLibs.filter(lib => 'natives' in lib), pack, APPPATH);

  };
}

function addNextPackToActualDownload() {
  return (dispatch, getState) => {
    const { downloadManager } = getState();
    const queueArr = Object.keys(downloadManager.downloadQueue);
    queueArr.some(pack => {
      if (!downloadManager.downloadQueue[pack].downloadCompleted) {
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
