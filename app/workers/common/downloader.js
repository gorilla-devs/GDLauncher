const path = require('path');
const async = require('async');
const mkdirp = require('mkdirp');
const fs = require('fs');
const Promise = require('bluebird');
const request = require('request-promise-native');


module.exports = {
  downloadArr
};
Promise.promisifyAll(async);

async function downloadArr(arr, process, folderPath, threads = 5) {
  for (const lib of arr) {
    const filePath = `${folderPath}${path.dirname(lib.path)}`;
    if (!fs.existsSync(filePath)) {
      mkdirp.sync(filePath);
    }
    const file = await request(lib.url, { encoding: 'binary' });
    fs.writeFileSync(`${folderPath}${lib.path}`, file, 'binary');

    process.send({ action: 'UPDATE__FILES' });

  };
}
