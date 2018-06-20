import axios from 'axios';
import * as https from 'https';
import * as fs from 'fs';
import async from 'async-es';


export const START_DOWNLOAD = 'START_DOWNLOAD';
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

export function downloadPack(pack) {
  return (dispatch, getState) => {
    const { downloadManager } = getState();
    // L' idea e' di salvare su disco un file di config e poi far fare tutto il lavoro alla fork.
    // La fork manterra' aggiornata l' UI sullo stato del lavoro ma nodejs non si occupera' di nulla
    const { fork } = require('child_process');
    const forked = fork(`${__dirname}/workers/downloadPackage.js`, {
      env: {
        name: downloadManager.downloadQueue[pack].name
      }
    });
    forked.on('message', (data) => {
      const { total, action } = data;
      switch (action) {
        case 'UPDATE__FILES':
          dispatch({
            type: DOWNLOAD_FILE_COMPLETED,
            payload: {
              pack
            }
          });
          break;
        case 'UPDATE__TOTAL':
          dispatch({
            type: UPDATE_TOTAL_FILES_TO_DOWNLOAD,
            payload: {
              pack,
              total
            }
          });
          break;
        case 'DOWNLOAD__COMPLETED':
          dispatch({
            type: DOWNLOAD_COMPLETED,
            payload: pack
          });
          // CHECK IF ANY ITEM EXISTS IN THE QUEUE YET TO BE DOWNLOADED.
          // IF YES, ADD IT TO THE ACTUALDOWNLOAD
          dispatch(addNextPackToActualDownload(pack));
          break;
        default:
          break;
      }
    });
  };
}

function addNextPackToActualDownload(previousPack) {
  return (dispatch, getState) => {
    const { downloadManager } = getState();
    const queueArr = Object.keys(downloadManager.downloadQueue);
    const actualPackIndex = queueArr.indexOf(previousPack);
    const nextPackName = queueArr[actualPackIndex + 1];
    if (actualPackIndex + 1 < queueArr.length) {
      dispatch({
        type: START_DOWNLOAD,
        payload: nextPackName
      });
      dispatch(downloadPack(nextPackName));
    }
  };
}
