import path from 'path';
import fs from 'fs';
import axios from 'axios';
import _ from 'lodash';
import makeDir from 'make-dir';
import SysOS from 'os';
import { promisify } from 'util';
import compressing from 'compressing';
import {
  INSTANCES_PATH,
  PACKS_PATH,
  CURSEFORGE_MODLOADERS_API,
  MC_LIBRARIES_URL
} from '../constants';
import { pathify, arraify, arraifyModules } from './strings';

export const extractMainJar = async json => {
  return [
    {
      url: json.downloads.client.url,
      path: path.join(INSTANCES_PATH, 'versions', json.id, `${json.id}.jar`)
    }
  ];
};

export const extractVanillaLibs = async json => {
  const libs = [];
  await Promise.all(
    json.libraries.filter(lib => !parseLibRules(lib.rules)).map(async lib => {
      if ('artifact' in lib.downloads) {
        libs.push({
          url: lib.downloads.artifact.url,
          path: path.join(INSTANCES_PATH, 'libraries', lib.downloads.artifact.path)
        });
      }
      if (
        'classifiers' in lib.downloads &&
        `natives-${convertOSToMCFormat(SysOS.type())}` in
        lib.downloads.classifiers
      ) {
        libs.push({
          url:
            lib.downloads.classifiers[
              `natives-${convertOSToMCFormat(SysOS.type())}`
            ].url,
          path:
            path.join(INSTANCES_PATH, 'libraries', lib.downloads.classifiers[
              `natives-${convertOSToMCFormat(SysOS.type())}`
            ].path),
          natives: true
        });
      }
    })
  );
  return libs;
};

export const extractNatives = async (libs, packName) => {
  const nativesPath = path.join(PACKS_PATH, packName, 'natives');
  try {
    await promisify(fs.access)(nativesPath);
  } catch (e) {
    await makeDir(nativesPath);
  }

  await Promise.all(
    libs.map(lib => compressing.zip.uncompress(lib.path, nativesPath))
  );
};

export const extractAssets = async json => {
  let res;
  const assets = [];
  const assetsFile = path.join(
    INSTANCES_PATH,
    'assets',
    'indexes',
    `${json.assets}.json`
  );
  // It saves the json into a file on /assets/indexes/${version}.json
  // If the file already exists, it reads data from there
  try {
    await promisify(fs.access)(assetsFile);
    res = await promisify(fs.readFile)(JSON.parse(assetsFile));
  } catch (e) {
    res = (await axios.get(json.assetIndex.url)).data;
    await makeDir(path.dirname(assetsFile));
    await promisify(fs.writeFile)(assetsFile, JSON.stringify(res));
  }

  // Returns the list of assets if they don't already exist
  Object.keys(res.objects).map(asset => {
    const assetCont = res.objects[asset];
    assets.push({
      url: `http://resources.download.minecraft.net/${assetCont.hash.substring(
        0,
        2
      )}/${assetCont.hash}`,
      path: path.join(INSTANCES_PATH, 'assets', 'objects', assetCont.hash.substring(0, 2), assetCont.hash),
      legacyPath: path.join(INSTANCES_PATH, 'assets', 'virtual', 'legacy', asset)
    });
  });
  return assets;
};

export const isVirtualAssets = async assetsName => {
  const assetsJSON = await promisify(fs.readFile)(path.join(
    INSTANCES_PATH,
    'assets',
    'indexes',
    `${assetsName}.json`
  ));
  return _.has(assetsJSON, 'virtual') && assetsJSON.virtual === true;
}

export const getForgeLibraries = async forge => {
  const forgeLibCalculator = async library => {
    let completeUrl;
    if (_.has(library, 'url')) {
      completeUrl = `${CURSEFORGE_MODLOADERS_API}/${arraify(
        library.name
      ).join('/')}`;
    } else {
      completeUrl = `${MC_LIBRARIES_URL}/${arraify(library.name).join('/')}`;
    }

    return {
      url: completeUrl,
      path: path.join(INSTANCES_PATH, 'libraries', ...arraify(library.name))
    };
  };

  let libraries = [];
  libraries = await Promise.all(
    forge.versionInfo.libraries
      // .filter(
      //   lib =>
      //     (_.has(lib, 'clientreq') && lib.clientreq) || !_.has(lib, 'clientreq')
      // )
      .filter(lib => !parseLibRules(lib.rules))
      .map(async lib => forgeLibCalculator(lib))
  );
  return libraries;
};

export const computeVanillaAndForgeLibraries = async (vnl, forge) => {
  let libraries = [];
  if (forge !== null) {
    libraries = await getForgeLibraries(forge);
  }
  libraries = libraries.concat(await extractVanillaLibs(vnl));

  return _.uniqBy(libraries, 'path');
};

// Returns whether the rules allow the file to be downloaded or not
function parseLibRules(rules) {
  let skip = false;
  if (rules) {
    skip = true;
    rules.forEach(({ action, os }) => {
      if (
        action === 'allow' &&
        ((os && SysOS.name === convertOSToMCFormat(SysOS.type())) || !os)
      ) {
        skip = false;
      }
      if (
        action === 'disallow' &&
        ((os && SysOS.name === convertOSToMCFormat(SysOS.type())) || !os)
      ) {
        skip = true;
      }
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
