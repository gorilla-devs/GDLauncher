const path = require('path');

const baseConfig = require('./webpack.config');

baseConfig.devtool = 'source-map';
baseConfig.target = 'electron-main';
baseConfig.entry = './public/electron.js';
baseConfig.output = {
  path: path.resolve(__dirname, 'build', 'electron')
};

module.exports = baseConfig;
