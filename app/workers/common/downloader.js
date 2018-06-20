const path = require('path');
const async = require('async');
const mkdirp = require('mkdirp');
const fs = require('fs');
const Promise = require('bluebird');
const axios = require('axios');


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
    const file = fs.createWriteStream(`${folderPath}${lib.path}`);
    try {
      await axios({
        method: 'get',
        url: lib.url,
        responseType: 'blob'
      }).then((response) => {
        process.send({ action: 'UPDATE__FILES' });
        file.write(response.data, () => file.end());
        return 0;
      });
    } catch (e) {
      console.log(e);
    }
  };
}
