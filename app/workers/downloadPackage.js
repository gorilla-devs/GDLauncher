const axios = require('axios');
const https = require('https');
const fs = require('fs');
const async = require('async');
const constants = require('../constants');
const vnlHelpers = require('./common/vanilla');

// VANILLA COMMONS

// EXTRACT MC LIBS
const vnl = JSON.parse(fs.readFileSync(`${constants.LAUNCHER_FOLDER}/${constants.PACKS_FOLDER_NAME}/${process.env.name}/vnl.json`));
console.log(vnl.assets);
const vnlLibs = vnlHelpers.extractLibs(vnl);

let counter = 0;

async.eachLimit(vnlLibs, 15, (url, callback) => {
  const filename = url.split('/').pop().split('#')[0].split('?')[0];
  const file = fs.createWriteStream(`${constants.LAUNCHER_FOLDER}/${constants.PACKS_FOLDER_NAME}/${process.env.name}/${filename}`);
  https.get(url, (res) => {
    res.on('data', (data) => {
      file.write(data);
    }).on('end', () => {
      file.end();
      process.send({ downloaded: ++counter, total: vnlLibs.length });
      callback();
    });
  });
}, (err) => {
  if (err) {
    console.log('A file failed to process');
  } else {
    console.log('COMPLETED')
  }
});
