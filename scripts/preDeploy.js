// This creates a JSON into the release folder containing the latest version.
// This is used whenever TravisCI needs to deploy
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function checksum(str, algorithm, encoding) {
  return crypto
    .createHash(algorithm || 'sha256')
    .update(str, 'utf8')
    .digest(encoding || 'hex')
}

const package = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json')));
const versionJSON = {
  latestVersion: package.version,
  updatedOn: new Date(),
  windows: {
    standalone: {
      url: "https://dl.gorilladevs.com/releases/GDLauncher-win.exe",
      checksum: checksum(fs.readFileSync(path.resolve(__dirname, '../', package.build.directories.output, 'GDLauncher-win.exe')))
    },
    portable: {
      url: "https://dl.gorilladevs.com/releases/GDLauncher-win.zip",
      checksum: checksum(fs.readFileSync(path.resolve(__dirname, '../', package.build.directories.output, 'GDLauncher-win.zip'))),
    }
  },
  linux: {
  }
};

fs.writeFileSync(path.resolve(__dirname, '../', package.build.directories.output, 'latest.json'), JSON.stringify(versionJSON));