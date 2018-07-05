const axios = require('axios');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const os = require('os');
const { promisify } = require('es6-promisify');
const extract = promisify(require('extract-zip'));
const constants = require('../../constants');

module.exports = {
  extractLibs,
  extractAssets,
  extractMainJar,
  extractNatives
};

// This is needed since the os names on the mc json and nodejs os lib do not match
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

// Returns whether the rules allow the file to be downloaded or not
function parseLibRules(rules) {
  let skip = false;
  if (rules) {
    skip = true;
    rules.forEach(({ action, los }) => {
      if (action === 'allow' && ((los && os.name === convertOSToMCFormat(os.type())) || !los)) { skip = false }
      if (action === 'disallow' && ((los && os.name === convertOSToMCFormat(os.type())) || !los)) { skip = true }
    });
  }
  return skip;
}

function extractLibs(json) {
  const libs = [];
  json.libraries.filter(lib => !parseLibRules(lib.rules)).map((lib) => {
    if ('artifact' in lib.downloads) {
      const filePath = `${constants.LAUNCHER_FOLDER}/libraries/${lib.downloads.artifact.path}`;
      if (!fs.existsSync(filePath)) {
        libs.push({
          url: lib.downloads.artifact.url,
          path: lib.downloads.artifact.path
        });
      }
    }
    if ('classifiers' in lib.downloads && `natives-${convertOSToMCFormat(os.type())}` in lib.downloads.classifiers) {
      libs.push({
        url: lib.downloads.classifiers[`natives-${convertOSToMCFormat(os.type())}`].url,
        path: lib.downloads.classifiers[`natives-${convertOSToMCFormat(os.type())}`].path,
        natives: true
      });
    }
  });
  return libs;
}

function extractMainJar(json) {
  const libs = [];
  const filePath = `${constants.LAUNCHER_FOLDER}/versions/${json.id}/${json.id}.jar`;
  if (!fs.existsSync(filePath)) {
    libs.push({
      url: json.downloads.client.url,
      path: `${json.id}/${json.id}.jar`
    });
  }
  return libs;
}

async function extractAssets(json) {
  const assets = [];
  await axios.get(json.assetIndex.url).then((res) => {
    // It saves the json into a file on /assets/indexes/${version}.json
    const assetsFile = `${constants.LAUNCHER_FOLDER}/assets/indexes/${json.id}.json`;
    if (!fs.existsSync(assetsFile)) {
      // Checks whether the dir exists. If not, it creates it
      if (!fs.existsSync(path.dirname(assetsFile))) {
        mkdirp.sync(path.dirname(assetsFile));
      }
      fs.writeFileSync(assetsFile, res.data);
    }
    // Returns the list of assets if they don't already exist
    return Object.keys(res.data.objects).map(asset => {
      const assetCont = res.data.objects[asset];
      const filePath = `${constants.LAUNCHER_FOLDER}/assets/objects/${assetCont.hash.substring(0, 2)}/${assetCont.hash}`;
      if (!fs.existsSync(filePath)) {
        assets.push({
          url: `http://resources.download.minecraft.net/${assetCont.hash.substring(0, 2)}/${assetCont.hash}`,
          path: `objects/${assetCont.hash.substring(0, 2)}/${assetCont.hash}`
        });
      }
    });
  });
  return assets;
}

async function extractNatives(libs) {
  const nativesPath = `${constants.LAUNCHER_FOLDER}/natives/`;
  if (!fs.existsSync(nativesPath)) {
    mkdirp.sync(nativesPath);
  }
  await Promise.all(libs.map(lib =>
    extract(`${constants.LAUNCHER_FOLDER}/libraries/${lib.path}`, { dir: `${process.cwd()}/${nativesPath}` })));
}
