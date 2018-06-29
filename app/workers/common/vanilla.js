const axios = require('axios');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const os = require('os');
const constants = require('../../constants');

module.exports = {
  extractLibs,
  extractAssets,
  extractMainJar
};

function isSameOS(ElectronFormat, MCFormat) {
  switch (ElectronFormat) {
    case 'Windows_NT':
      if (MCFormat === 'windows') {
        return true;
      }
      break;
    case 'Darwin':
      if (MCFormat === 'osx') {
        return true;
      }
      break;
    case 'Linux':
      if (MCFormat === 'linux') {
        return true;
      }
      break;
    default:
      return false;
  }
}

function extractLibs(json) {
  const libs = [];
  json.libraries.map((lib) => {
    // Check for [rules] (allowed, disallowed)
    if ('rules' in lib) {
      lib.rules.map(rule => {
        if (rule.action === 'allow' && (!('os' in rule) || isSameOS(os.type, rule.os.name))) {
          // THIS IS TO DOWNLOAD
        }
      });
    }
    if ('artifact' in lib.downloads) {
      const filePath = `${constants.LAUNCHER_FOLDER}/libraries/${lib.downloads.artifact.path}`;
      if (!fs.existsSync(filePath)) {
        libs.push({
          url: lib.downloads.artifact.url,
          path: lib.downloads.artifact.path
        });
      }
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
