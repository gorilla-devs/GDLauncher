/* eslint-disable global-require */

const os = require('os');

let addon = null;
if (os.platform() === 'win32') {
  addon = require('./win32/murmur2.node');
} else if (os.platform() === 'linux') {
  addon = require('./linux/murmur2.node');
} else if (os.platform() === 'darwin') {
  addon = require('./darwin/murmur2.node');
}

const addonPromise = filePath => {
  return new Promise((resolve, reject) => {
    addon.murmur2(filePath, (err, value) => {
      if (value) resolve(value);
      reject(err);
    });
  });
};

module.exports = addonPromise;
