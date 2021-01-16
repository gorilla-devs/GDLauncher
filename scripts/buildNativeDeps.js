const build = require('electron-build-env');
const fs = require('fs');
const path = require('path');
const rebuild = require('electron-rebuild').default;

const packageJson = fs.readFileSync('package.json');

const electronVersion = JSON.parse(
  packageJson
).devDependencies.electron.replace('^', '');

const main = async () => {
  await new Promise((resolve, reject) => {
    build(
      ['neon', 'build', 'murmur2-calculator', '--release'],
      {
        electron: electronVersion
      },
      err => {
        if (err) {
          console.log('Installation failed.');
          reject(err);
        } else {
          console.log('Installation succeeded!');
          resolve();
        }
      }
    );
  });

  await rebuild(path.resolve(__dirname, '../'), electronVersion, 'x64');
};

main();
