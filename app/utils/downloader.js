import makeDir from 'make-dir';
import fss from 'fs';
const path = require('path');
const assert = require('assert');
const os = require('os');
import log from 'electron-log';
const Promise = require('bluebird');
const request = require('request-promise-native');
const { promisify } = require('util');
import { DOWNLOAD_FILE_COMPLETED } from '../actions/downloadManager';

module.exports = {
  downloadArr,
  downloadFile
};

const fs = Promise.promisifyAll(fss);

async function downloadArr(arr, folderPath, dispatch, pack, threads = os.cpus().length) {
  await Promise.map(arr, async item => {
    // TODO: item.legacyPath ? path.join(folderPath, item.legacyPath) : null
    // Handle legacyPaths better (own function)
    await downloadFile(path.join(folderPath, item.path), item.url);
    dispatch({
      type: DOWNLOAD_FILE_COMPLETED,
      payload: { pack }
    });
  }, { concurrency: threads });
}

async function downloadFile(filename, url, legacyPath = null) {
  try {
    const filePath = path.dirname(filename);
    try {
      await fs.accessAsync(filePath);
    } catch (e) {
      await makeDir(filePath);
    }
    const file = await request(url, { encoding: 'binary' });
    await fs.writeFileAsync(filename, file, 'binary');
    // This handles legacy assets.
    if (legacyPath !== null && legacyPath !== undefined) {
      try {
        await fs.accessAsync(legacyPath);
      } catch (e) {
        try {
          await fs.accessAsync(path.dirname(legacyPath));
        } catch (e) {
          await makeDir(path.dirname(legacyPath));
        } finally {
          await fs.writeFileAsync(legacyPath, file, 'binary');
        }
      }
    }
  } catch (e) {
    log.error(e);
  }
}

// function checkFile(lpath, size, sha1) {
//   return fs.stat(lpath).then(stats => assert.equal(stats.size, size, 'wrong size for ' + lpath))
//     .then(() => fs.readFile(lpath))
//     .then(data => assert.equal(crypto.createHash('sha1').update(data).digest('hex'), sha1, `wrong sha1 for ${lpath}`))
//     .then(() => lpath);
// }