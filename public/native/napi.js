/* eslint-disable global-require */

const os = require('os');

let addon = null;
if (os.platform() === 'win32') {
  addon = require('./win32/napi.node');
} else if (os.platform() === 'linux') {
  addon = require('./linux/napi.node');
} else if (os.platform() === 'darwin') {
  if (os.arch() === 'arm64') {
    addon = require('./darwin/napi.node');
  } else {
    addon = require('./darwin/napi.node');
  }
}

module.exports = addon;
