const path = require('path');
const constants = require('../constants');
const fs = require('fs');
const axios = require('axios');
const SysOS = require('os');
const { promisify } = require('es6-promisify');
const mkdirp = promisify(require('mkdirp'));
const extract = promisify(require('extract-zip'));

module.exports = {
  extractMainJar: async (json, CheckForExists = true) => {
    const libs = [];
    const filePath = path.join(constants.APPPATH, constants.LAUNCHER_FOLDER, 'versions', json.id, `${json.id}.jar`);
    if (CheckForExists) {
      if (!(await fs.exists(filePath))) {
        libs.push({
          url: json.downloads.client.url,
          path: `${json.id}/${json.id}.jar`
        });
      }
    } else {
      libs.push({
        url: json.downloads.client.url,
        path: `${json.id}/${json.id}.jar`
      });
    }
    return libs;
  },
  extractLibs: async (json, CheckForExists = true) => {
    const libs = [];
    await json.libraries.filter(lib => !parseLibRules(lib.rules)).map(async (lib) => {
      if ('artifact' in lib.downloads) {
        const filePath = path.join(constants.APPPATH, constants.LAUNCHER_FOLDER, 'libraries', lib.downloads.artifact.path);
        if (CheckForExists) {
          if (!(await fs.exists(filePath))) {
            libs.push({
              url: lib.downloads.artifact.url,
              path: lib.downloads.artifact.path
            });
          }
        } else {
          libs.push({
            url: lib.downloads.artifact.url,
            path: lib.downloads.artifact.path
          });
        }
      }
      if ('classifiers' in lib.downloads && `natives-${convertOSToMCFormat(SysOS.type())}` in lib.downloads.classifiers) {
        libs.push({
          url: lib.downloads.classifiers[`natives-${convertOSToMCFormat(SysOS.type())}`].url,
          path: lib.downloads.classifiers[`natives-${convertOSToMCFormat(SysOS.type())}`].path,
          natives: true
        });
      }
    });
    return libs;
  },
  extractNatives: async (libs, packName, appPath) => {
    const nativesPath = path.join(appPath, constants.LAUNCHER_FOLDER, constants.PACKS_FOLDER_NAME, packName, 'natives');
    if (!(await fs.exists(nativesPath))) {
      await mkdirp(nativesPath);
    }
    await Promise.all(libs.map(lib =>
      extract(path.join(appPath, constants.LAUNCHER_FOLDER, 'libraries', lib.path), { dir: `${nativesPath}` })));
  },
  extractAssets: async (json) => {
    const assets = [];
    await axios.get(json.assetIndex.url).then(async (res) => {
      // It saves the json into a file on /assets/indexes/${version}.json
      const assetsFile = path.join(constants.APPPATH, constants.LAUNCHER_FOLDER, 'assets', 'indexes', `${json.assets}.json`);
      if (!(await fs.exists(assetsFile))) {
        // Checks whether the dir exists. If not, it creates it
        if (!(await fs.exists(path.dirname(assetsFile)))) {
          await mkdirp(path.dirname(assetsFile));
        }
        await fs.writeFile(assetsFile, JSON.stringify(res.data));
      }
      // Returns the list of assets if they don't already exist
      return Object.keys(res.data.objects).map(async (asset) => {
        const assetCont = res.data.objects[asset];
        const filePath = path.join(constants.APPPATH, constants.LAUNCHER_FOLDER, 'assets', 'objects', assetCont.hash.substring(0, 2), assetCont.hash);
        if (!(await fs.exists(filePath))) {
          assets.push({
            url: `http://resources.download.minecraft.net/${assetCont.hash.substring(0, 2)}/${assetCont.hash}`,
            path: `objects/${assetCont.hash.substring(0, 2)}/${assetCont.hash}`,
            legacyPath: `virtual/legacy/${asset}`
          });
        }
      });
    });
    return assets;
  }
};


// Returns whether the rules allow the file to be downloaded or not
function parseLibRules(rules) {
  let skip = false;
  if (rules) {
    skip = true;
    rules.forEach(({ action, os }) => {
      if (action === 'allow' && ((os && SysOS.name === convertOSToMCFormat(SysOS.type())) || !os)) { skip = false; }
      if (action === 'disallow' && ((os && SysOS.name === convertOSToMCFormat(SysOS.type())) || !os)) { skip = true; }
    });
  }
  return skip;
}

// This is needed since the SysOS names on the mc json and nodejs SysOS lib do not match
function convertOSToMCFormat(ElectronFormat) {
  switch (ElectronFormat) {
    case 'Windows_NT':
      return 'windows';
    case 'Darwin':
      return 'osx';
    case 'Linux':
      return 'linux';
    default:
      return false;
  }
}
