const axios = require('axios');
const https = require('http');
const fs = require('fs');
const async = require('async');

// VANILLA COMMONS

// EXTRACT MC LIBS


async.eachLimit([
  "http://ovh.net/files/1Gio.dat"
], 3, (url, callback) => {
  const filename = url.split('/').pop().split('#')[0].split('?')[0];
  const file = fs.createWriteStream(`dl/${filename}`);
  https.get(url, (res) => {
    res.on('data', (data) => {
      file.write(data);
    }).on('end', () => {
      file.end();
      console.log(url + ' downloaded');
    });
  });
  callback();
}, (err) => {
  if (err) {
    console.log('A file failed to process');
  } else {
    console.log('COMPLETED')
  }
});
