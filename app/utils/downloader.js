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
  downloadArr
};

async function downloadArr(arr, folderPath, dispatch, pack, threads = os.cpus().length) {
  await Promise.map(arr, async item => {
    try {
      const filePath = path.join(folderPath, path.dirname(item.path));
      if (!await promisify(fs.exists)(filePath)) {
        await mkdirp(filePath);
      }
      const file = await request(item.url, { encoding: 'binary' });
      await promisify(fs.writeFile)(path.join(folderPath, item.path), file, 'binary');
      if (item.legacyPath && !await promisify(fs.exists)(item.legacyPath)) {
        const legacyPath = path.join(folderPath, path.dirname(item.legacyPath));
        if (!await promisify(fs.exists)(legacyPath)) {
          await mkdirp(legacyPath);
        }
        await promisify(fs.writeFile)(path.join(folderPath, item.legacyPath), file, 'binary');
      }
      dispatch({
        type: DOWNLOAD_FILE_COMPLETED,
        payload: { pack }
      });
    } catch (e) {
      console.log(e);
    }
  }, { concurrency: 3 });
}


function checkFile(lpath, size, sha1) {
  return fs.stat(lpath).then(stats => assert.equal(stats.size, size, 'wrong size for ' + lpath))
    .then(() => fs.readFile(lpath))
    .then(data => assert.equal(crypto.createHash('sha1').update(data).digest('hex'), sha1, `wrong sha1 for ${lpath}`))
    .then(() => lpath);
}