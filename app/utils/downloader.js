const path = require('path');
const mkdirp = require('mkdirp');
const fs = require('fs');
const assert = require('assert');
const os = require('os');
const Promise = require('bluebird');
const request = require('request-promise-native');
const { promisify } = require('util');
import { DOWNLOAD_FILE_COMPLETED } from '../actions/downloadManager';

module.exports = {
  downloadArr,
  downloadFile
};

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
    if (!await promisify(fs.exists)(filePath)) {
      await mkdirp(filePath);
    }
    const file = await request(url, { encoding: 'binary' });
    await promisify(fs.writeFile)(filename, file, 'binary');
    // This handles legacy assets.
    if (legacyPath !== null && legacyPath !== undefined && !await promisify(fs.exists)(legacyPath)) {
      if (!await promisify(fs.exists)(path.dirname(legacyPath))) {
        await mkdirp(path.dirname(legacyPath));
      }
      await promisify(fs.writeFile)(legacyPath, file, 'binary');
    }
  } catch (e) {
    console.error(e);
  }
}

function checkFile(lpath, size, sha1) {
  return fs.stat(lpath).then(stats => assert.equal(stats.size, size, 'wrong size for ' + lpath))
    .then(() => fs.readFile(lpath))
    .then(data => assert.equal(crypto.createHash('sha1').update(data).digest('hex'), sha1, `wrong sha1 for ${lpath}`))
    .then(() => lpath);
}