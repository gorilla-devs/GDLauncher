const axios = require('axios');
const https = require('https');
const fs = require('fs');
const async = require('async');
const constants = require('../constants');
const vnlHelpers = require('./common/vanilla');

// //////////////////
// //VANILLA STUFF///
// //////////////////

// EXTRACT MC LIBS
const vnlPath = `${constants.LAUNCHER_FOLDER}/${constants.PACKS_FOLDER_NAME}/${process.env.name}`;
const vnlRead = fs.readFileSync(`${vnlPath}/vnl.json`);
const vnlJSON = JSON.parse(vnlRead);
const vnlLibs = vnlHelpers.extractLibs(vnlJSON);

// EXTRACT MC ASSETS

// EXTRACT MC MAIN JAR

// ///////////////////
// //MAIN DOWNLOADER//
// ///////////////////

// Counter of the downloaded files
let counter = 0;

async.eachLimit(vnlLibs, 15, (url, callback) => {
  const filename = url.split('/').pop().split('#')[0].split('?')[0];
  const file = fs.createWriteStream(`${vnlPath}/${filename}`);
  https.get(url, (res) => {
    res.on('data', (data) => {
      file.write(data);
    }).on('end', () => {
      file.end();
      process.send({ downloaded: ++counter, total: vnlLibs.length, action: 'UPDATE__FILES' });
      callback();
    });
  });
}, (err) => {
  if (err) {
    console.log('A file failed to process');
  } else {
    process.send({ action: 'DOWNLOAD__COMPLETED' });
  }
});
