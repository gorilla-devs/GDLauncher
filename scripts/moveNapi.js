const fs = require('fs');
const os = require('os');

fs.renameSync('./napi.node', `../public/native/${os.platform()}/napi.node`);
// fs.renameSync('./index.d.ts', `../public/native/${os.platform()}/index.d.ts`);
