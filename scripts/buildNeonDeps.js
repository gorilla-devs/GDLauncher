const build = require('electron-build-env');
const fs = require('fs');

const packageJson = fs.readFileSync('package.json');

build(
  ['neon', 'build', 'murmur2-calculator', '--release'],
  {
    electron: JSON.parse(packageJson).devDependencies.electron.replace('^', '')
  },
  err => {
    if (err) {
      console.log('Installation failed.');
    } else {
      console.log('Installation succeeded!');
    }
  }
);
