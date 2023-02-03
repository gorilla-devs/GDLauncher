const fs = require('fs');

if (!fs.existsSync('./public/native')) fs.mkdirSync('./public/native');

fs.copyFileSync(
  './node_modules/nsfw/build/Release/nsfw.node',
  `./public/native/nsfw.node`
);
