import makeDir from 'make-dir';
import fss from 'fs';
import reqCall from 'request';
import path from 'path';
import assert from 'assert';
import { cpus } from 'os';
import _ from 'lodash';
import log from 'electron-log';
import Promise from 'bluebird';
import request from 'request-promise-native';
import { promisify } from 'util';

const fs = Promise.promisifyAll(fss);

export const downloadArr = async (
  arr,
  updatePercentage,
  pack,
  forceDownload = false,
  threads = cpus().length
) => {
  let downloaded = 0;
  await Promise.map(
    arr,
    async item => {
      let toDownload = true;
      if (!forceDownload) {
        try {
          await fs.accessAsync(item.path);
          toDownload = false;
        } catch (err) {
          // It needs to be downloaded
        }
      }

      if (toDownload) {
        let counter = 0;
        let res = false;
        do {
          res = await downloadFileInstance(item.path, item.url);
          counter += 1;
        } while(!res && counter < 3);
      }
      downloaded += 1;
      if (downloaded % 10 === 0 || downloaded === arr.length)
        updatePercentage(downloaded);
    },
    { concurrency: threads + 2 }
  );
};

const downloadFileInstance = async (filename, url) => {
  try {
    const filePath = path.dirname(filename);
    try {
      await fs.accessAsync(filePath);
    } catch (e) {
      await makeDir(filePath);
    }
    const file = await request(url, { encoding: 'binary' });
    await fs.writeFileAsync(filename, file, 'binary');
    return true;
  } catch (e) {
    log.error(
      `Error while downloading <${url}> to <${filename}> --> ${e.message}`
    );
    return false;
  }
};

export const downloadFile = (filename, url, onProgress) => {
  return new Promise(async (resolve, reject) => {
    // Save variable to know progress
    let received_bytes = 0;
    let total_bytes = 0;

    const req = reqCall({
      method: 'GET',
      uri: url
    });
    await makeDir(path.dirname(filename));
    const out = fss.createWriteStream(filename);
    req.pipe(out);

    req.on('response', data => {
      // Change the total bytes value to get progress later.
      total_bytes = parseInt(data.headers['content-length']);
    });

    req.on('data', chunk => {
      // Update the received bytes
      received_bytes += chunk.length;
      onProgress(((received_bytes * 100) / total_bytes).toFixed(1));
    });

    req.on('end', () => {
      resolve();
    });

    req.on('error', () => {
      reject();
    });
  });
};

// function checkFile(lpath, size, sha1) {
//   return fs.stat(lpath).then(stats => assert.equal(stats.size, size, 'wrong size for ' + lpath))
//     .then(() => fs.readFile(lpath))
//     .then(data => assert.equal(crypto.createHash('sha1').update(data).digest('hex'), sha1, `wrong sha1 for ${lpath}`))
//     .then(() => lpath);
// }
