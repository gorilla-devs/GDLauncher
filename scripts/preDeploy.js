// This creates a JSON into the release folder containing the latest version.
// This is used whenever TravisCI needs to deploy
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const os = require('os');


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
    url: "https://dl.gorilladevs.com/releases/GDLauncher-win.zip",
    checksum: checksum(fs.readFileSync(path.resolve(__dirname, '../', package.build.directories.output, 'GDLauncher-win.zip'))),
  },
  linux: {
    url: "https://dl.gorilladevs.com/releases/GDLauncher-linux.zip",
    checksum: checksum(fs.readFileSync(path.resolve(__dirname, '../', package.build.directories.output, 'GDLauncher-linux.zip'))),
  }
};

const getChecksums = function (dir) {
  var results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function (file) {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      const res = getChecksums(file);
      results = results.concat(res);
    } else {
      results.push({
        filename: path.relative(path.resolve(__dirname, '../', package.build.directories.output, 'win-unpacked'), file),
        sha256: checksum(fs.readFileSync(file))
      });
    }
  });
  return results;
};

const files = getChecksums(path.resolve(__dirname, '../', package.build.directories.output, 'win-unpacked'));


// const ls = spawn(
//   path.resolve(__dirname, '../', 'bin', `7za${os.platform() === 'win32' ? '.exe' : ''}`), [
//     'a',
//     '-t7z',
//     path.resolve(__dirname, '../', package.build.directories.output, 'app.asar.7z'),
//     path.resolve(__dirname, '../', package.build.directories.output, 'win-unpacked', 'resources', 'app.asar')
//   ]);

// ls.stdout.on('data', (data) => {
//   console.log(`stdout: ${data}`);
// });

// ls.stderr.on('data', (data) => {
//   console.log(`stderr: ${data}`);
// });

// ls.on('close', (code) => {
//   console.log(`child process exited with code ${code}`);
// });

fs.writeFileSync(path.resolve(__dirname, '../', package.build.directories.output, 'latest.json'), JSON.stringify(versionJSON));
fs.writeFileSync(path.resolve(__dirname, '../', package.build.directories.output, 'latestChecksums.json'), JSON.stringify(files));