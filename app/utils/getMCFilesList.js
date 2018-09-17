import path from 'path';
import fs from 'fs';
import axios from 'axios';
import _ from 'lodash';
import makeDir from 'make-dir';
import SysOS from 'os';
import { promisify } from 'util';
import { INSTANCES_PATH, PACKS_PATH, MAVEN_REPO, MC_LIBRARIES_URL } from '../constants';
import { pathify, arraify, arraifyModules } from '../utils/strings';

const extract = promisify(require('extract-zip'));

export const extractMainJar = async (json) => {
  return [{
    url: json.downloads.client.url,
    path: `${json.id}/${json.id}.jar`
  }];
};

export const extractVanillaLibs = async (json) => {
  const libs = [];
  await Promise.all(json.libraries.filter(lib => !parseLibRules(lib.rules)).map(async (lib) => {
    if ('artifact' in lib.downloads) {
      libs.push({
        url: lib.downloads.artifact.url,
        path: lib.downloads.artifact.path
      });
    }
    if ('classifiers' in lib.downloads && `natives-${convertOSToMCFormat(SysOS.type())}` in lib.downloads.classifiers) {
      libs.push({
        url: lib.downloads.classifiers[`natives-${convertOSToMCFormat(SysOS.type())}`].url,
        path: lib.downloads.classifiers[`natives-${convertOSToMCFormat(SysOS.type())}`].path,
        natives: true
      });
    }
  }));
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
  const res = await axios.get(json.assetIndex.url);
  // It saves the json into a file on /assets/indexes/${version}.json
  const assetsFile = path.join(INSTANCES_PATH, 'assets', 'indexes', `${json.assets}.json`);
  await makeDir(path.dirname(assetsFile));
  try { await promisify(fs.access)(assetsFile) }
  catch (e) { await promisify(fs.writeFile)(assetsFile, JSON.stringify(res.data)) }

  // Returns the list of assets if they don't already exist
  Object.keys(res.data.objects).map((asset) => {
    const assetCont = res.data.objects[asset];
    assets.push({
      url: `http://resources.download.minecraft.net/${assetCont.hash.substring(0, 2)}/${assetCont.hash}`,
      path: `objects/${assetCont.hash.substring(0, 2)}/${assetCont.hash}`,
      legacyPath: `virtual/legacy/${asset}`
    });
  });
  return assets;
};

export const forgeLibCalculator = async (library) => {
  const baseUrl = _.has(library, 'url') ? MAVEN_REPO : MC_LIBRARIES_URL;
  let completeUrl = `${baseUrl}/${arraify(library.name).join('/')}`;
  const insert = (n, ins, arr) => [...arr.slice(0, n), ins, ...arr.slice(n + 1)]

  // The url can have a "modules" path in the middle, but we do not know which ones do. We try a head request without,
  // if it fails it means it needs the modules path
  try { await axios.head(completeUrl) }
  catch (e) { completeUrl = `${baseUrl}/${arraifyModules(library.name).join('/')}` }
  return {
    url: completeUrl,
    path: path.join(...arraify(library.name))
  };
}

export const computeLibraries = async (vnl, forge) => {
  let libraries = [];
  if (forge !== null) {
    libraries = await Promise.all(forge.libraries
      .filter(lib => (_.has(lib, 'clientreq') && lib.clientreq) || (!_.has(lib, 'clientreq')))
      .map(async lib => await forgeLibCalculator(lib)));
  }
  libraries = libraries.concat(await extractVanillaLibs(vnl));
  
  return _.uniq(libraries);
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
