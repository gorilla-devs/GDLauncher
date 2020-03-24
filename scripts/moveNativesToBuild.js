const fs = require('fs');
const path = require('path');

const nodes = fs.readdirSync(path.resolve(__dirname, '../'));

for (const node of nodes) {
  if (path.extname(node) === '.node') {
    fs.renameSync(
      path.resolve(__dirname, '../', node),
      path.resolve(__dirname, '../build', node)
    );
  }
}
