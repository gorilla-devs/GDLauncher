const axios = require('axios');
const https = require('http');
const fs = require('fs');
const async = require('async');

console.log(process);

async.eachLimit([
  "http://ovh.net/files/1Gio.dat"
], 3, (url, callback) => {
  const filename = url.split('/').pop().split('#')[0].split('?')[0];
  var file = fs.createWriteStream(`dl/${filename}`);
  https.get(url, (res) => {
    res.on('data', function (data) {
      file.write(data);
    }).on('end', function () {
      file.end();
      console.log(url + ' downloaded');
    });
  });
  callback();
}, (err) => {
  if (err) {
    console.log('A file failed to process');
  } else {
    console.log("COMPLETED")
  }
});
