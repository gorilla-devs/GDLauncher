import axios from 'axios';
import fs from 'fs';
import path from 'path';
import asar from 'asar';
import { promisify } from 'util';
import Promise from "bluebird";
import log from 'electron-log';
import crypto from 'crypto';
import * as packageJson from '../../package.json';
import versionsCompare from '../utils/versionsCompare';
import { UPDATE_URL, APPPATH } from '../constants';

export const START_UPDATING = "START_CHECK_UPDATES";
export const STOP_UPDATING = "STOP_CHECK_UPDATES";
export const UPDATE_AVAILABLE = "UPDATE_AVAILABLE";


export function checkForUpdates() {
  return async dispatch => {
    try {
      const res = await axios.get(UPDATE_URL);
      const actualVersion = packageJson.version;
      // versionsCompare returns positive if v1 > v2, negative if v1 < v2, 0 if they're equal
      if (versionsCompare(res.data.version, actualVersion) === 1) {
        dispatch({
          type: UPDATE_AVAILABLE,
          payload: res.data.version
        });
      }
    } catch (err) {
      log.error(err.message);
    }
  }
}

export function update() {
  return async dispatch => {
    // try {
    //   const latestChecksums = await axios.get(UPDATE_URL_CHECKSUMS);
    //   let filesToDownload = [];
    //   latestChecksums.data.forEach(async (file) => {
    //     if (path.extname(file.filename) === '.asar') {
    //       try {
    //         const is = await promisify(fs.readdir)(path.join(APPPATH, file.filename));
    //         console.log(is);
    //       } catch (err) {
    //         console.log("Does not exist")
    //       }
    //     } else {
    //       try {
    //         const exists = await promisify(fs.exists)(path.join(APPPATH, file.filename));
    //         if(!exists || checksum(await promisify(fs.readFile)(path.join(APPPATH, file.filename))) !== file.sha256) {
    //           console.log(`${file.filename} to download`, checksum(await promisify(fs.readFile)(path.join(APPPATH, file.filename))), file.sha256);
    //         }
    //       } catch (err) {
    //         console.log(err.message);
    //       }
    //     }
    //   })
    // } catch (err) {

    // }
  }
}

function checksum(str, algorithm, encoding) {
  return crypto
    .createHash(algorithm || 'sha256')
    .update(str, 'utf8')
    .digest(encoding || 'hex')
}