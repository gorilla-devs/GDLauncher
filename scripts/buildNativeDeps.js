const build = require('electron-build-env');
const fs = require('fs');
const path = require('path');
const rebuild = require('electron-rebuild').default;

const packageJson = fs.readFileSync('package.json');

const electronVersion = JSON.parse(
  packageJson
).devDependencies.electron.replace('^', '');

const main = async () => {
  build(
    ['neon', 'build', 'murmur2-calculator', '--release'],
    {
      electron: electronVersion
    },
    err => {
      if (err) {
        console.log('Installation failed.');
      } else {
        console.log('Installation succeeded!');
      }
    }
  );

  await rebuild(path.resolve(__dirname, '../'), electronVersion, 'ia32');
};

main();
