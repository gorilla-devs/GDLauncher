import axios from 'axios';
import * as https from 'https';
import * as fs from 'fs';
import async from 'async-es';
import { LAUNCHER_FOLDER } from '../constants';


export const ADD_TO_ACTUAL_DOWNLOAD = 'ADD_TO_ACTUAL_DOWNLOAD';
export const ADD_TO_QUEUE = 'ADD_TO_QUEUE';
export const DOWNLOAD_COMPLETED = 'DOWNLOAD_COMPLETED';
export const DOWNLOAD_FILE_COMPLETED = 'DOWNLOAD_FILE_COMPLETED';

export function addToActualDownload(pack) {
  return (dispatch) => {
    dispatch({
      type: ADD_TO_ACTUAL_DOWNLOAD,
      payload: pack
    });
  };
}

export function addToQueue(pack, packType) {
  return (dispatch, getState) => {
    const { vanilla } = getState();
    dispatch({
      type: ADD_TO_QUEUE,
      payload: pack,
      packType
    });
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
        PACKINFO: downloadManager.downloadQueue[pack]
      }
    });


  };
}
