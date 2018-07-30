const path = require('path');
const async = require('async');
const mkdirp = require('mkdirp');
const fs = require('fs');
const assert = require('assert');
const os = require('os');
const Promise = require('bluebird');
const request = require('request-promise-native');
const constants = require('../../constants');


module.exports = {
  downloadArr
};
const parallel = Promise.promisify(async.eachLimit);

async function downloadArr(arr, process, folderPath, threads = os.cpus().length) {
  await parallel(arr, threads, async (item) => {
    try {
      const filePath = `${folderPath}${path.dirname(item.path)}`;
      if (!fs.existsSync(filePath)) {
        mkdirp.sync(filePath);
      }
      const file = await request(item.url, { encoding: 'binary' });
      fs.writeFileSync(`${folderPath}${item.path}`, file, 'binary');
      if (item.legacyPath && !fs.existsSync(item.legacyPath)) {
        const legacyPath = `${folderPath}${path.dirname(item.legacyPath)}`;
        if (!fs.existsSync(legacyPath)) {
          mkdirp.sync(legacyPath);
        }
        fs.writeFileSync(`${folderPath}${item.legacyPath}`, file, 'binary');
      }

      process.send({ action: 'UPDATE__FILES' });
    } catch (e) {
      process.send({ action: 'CER_PIPE', msg: `Error downloading ${item.url}: ${e}` });
    }
  });
}

function checkFile(lpath, size, sha1) {
  return fs.stat(lpath).then(stats => assert.equal(stats.size, size, 'wrong size for ' + lpath))
    .then(() => fs.readFile(lpath))
    .then(data => assert.equal(crypto.createHash('sha1').update(data).digest('hex'), sha1, `wrong sha1 for ${lpath}`))
    .then(() => lpath);
}