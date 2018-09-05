import { INSTANCES_PATH, PACKS_PATH } from '../constants';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import makeDir from 'make-dir';
import es6promisify from 'es6-promisify';
import SysOS from 'os';
import { promisify } from 'util';

const extract = promisify(require('extract-zip'));

export const extractMainJar = async (json, CheckForExists = true) => {
  const libs = [];
  const filePath = path.join(INSTANCES_PATH, 'versions', json.id, `${json.id}.jar`);
  if (CheckForExists) {
    try {
      await promisify(fs.access)(filePath);
    } catch (e) {
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
};

export const extractLibs = async (json, CheckForExists = true) => {
  const libs = [];
  await json.libraries.filter(lib => !parseLibRules(lib.rules)).map(async (lib) => {
    if ('artifact' in lib.downloads) {
      const filePath = path.join(INSTANCES_PATH, 'libraries', lib.downloads.artifact.path);
      if (CheckForExists) {
        try {
          await promisify(fs.access)(filePath);
        } catch (e) {
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
};

export const extractNatives = async (libs, packName) => {
  const nativesPath = path.join(PACKS_PATH, packName, 'natives');
  try {
    await promisify(fs.access)(nativesPath);
  } catch (e) {
    await makeDir(nativesPath);
  }

  await Promise.all(libs.map(lib =>
    extract(path.join(INSTANCES_PATH, 'libraries', lib.path), { dir: `${nativesPath}` })));
};

export const extractAssets = async (json) => {
  const assets = [];
  await axios.get(json.assetIndex.url).then(async (res) => {
    // It saves the json into a file on /assets/indexes/${version}.json
    const assetsFile = path.join(INSTANCES_PATH, 'assets', 'indexes', `${json.assets}.json`);
    try {
      // Checks whether the dir exists. If not, it creates it
      await promisify(fs.access)(path.dirname(assetsFile));
    } catch (e) {
      await makeDir(path.dirname(assetsFile));
    }
    finally {
      try {
        await promisify(fs.access)(assetsFile);
      } catch (e) {
        await promisify(fs.writeFile)(assetsFile, JSON.stringify(res.data));
      }
    }

    // Returns the list of assets if they don't already exist
    return Object.keys(res.data.objects).map(async (asset) => {
      const assetCont = res.data.objects[asset];
      const filePath = path.join(INSTANCES_PATH, 'assets', 'objects', assetCont.hash.substring(0, 2), assetCont.hash);
      try {
        await promisify(fs.access)(filePath);
      } catch (e) {
        assets.push({
          url: `http://resources.download.minecraft.net/${assetCont.hash.substring(0, 2)}/${assetCont.hash}`,
          path: `objects/${assetCont.hash.substring(0, 2)}/${assetCont.hash}`,
          legacyPath: `virtual/legacy/${asset}`
        });
      }
    });
  });
  return assets;
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
