const fs = require('fs');
const path = require('path');
const constants = require('../constants');
const vnlHelpers = require('../utils/getMCFilesList');
const downloader = require('./common/downloader');

async function main() {
  // //////////////////
  // //VANILLA STUFF///
  // //////////////////
  try {
    const vnlPath = path.join(process.env.appPath, constants.LAUNCHER_FOLDER, constants.PACKS_FOLDER_NAME, process.env.name);
    const vnlRead = fs.readFileSync(`${vnlPath}/vnl.json`);
    const vnlJSON = JSON.parse(vnlRead);

    // EXTRACT MC LIBS
    const vnlLibs = await vnlHelpers.extractLibs(vnlJSON);

    // EXTRACT MC ASSETS

    const vnlAssets = await vnlHelpers.extractAssets(vnlJSON);

    // EXTRACT MC MAIN JAR

    const mainJar = await vnlHelpers.extractMainJar(vnlJSON);

    // ///////////////////
    // //MAIN DOWNLOADER//
    // ///////////////////
    // UPDATES THE TOTAL FILES TO DOWNLOAD
    process.send({ downloaded: 0, total: vnlLibs.length + vnlAssets.length + mainJar.length, action: 'UPDATE__TOTAL' });
    await downloader.downloadArr(vnlLibs, process, path.join(process.env.appPath, constants.LAUNCHER_FOLDER, 'libraries'));

    await downloader.downloadArr(vnlAssets, process, path.join(process.env.appPath, constants.LAUNCHER_FOLDER, 'assets'), 10);

    await downloader.downloadArr(mainJar, process, path.join(process.env.appPath, constants.LAUNCHER_FOLDER, 'versions'));

    await vnlHelpers.extractNatives(vnlLibs.filter(lib => 'natives' in lib), process.env.name, process.env.appPath);

    process.send({ action: 'DOWNLOAD__COMPLETED' });
  } catch (err) {
    // Handles any error
    console.error(err);
    process.send({ action: 'CER_PIPE', msg: `FATAL ERROR DOWNLOADING ${process.env.name}: ${err}` });
  }
}

// STARTS THE EXECUTION
main();
