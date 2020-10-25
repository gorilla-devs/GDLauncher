import { omitBy } from 'lodash';
import log from 'electron-log';
import {
  getAddonCategories,
  getFabricManifest,
  getForgeManifest,
  getJavaManifest,
  getMcManifest
} from '../../common/api';
import EV from '../../common/messageEvents';
import { reflect } from '../../common/utils';
import generateMessageId from '../../common/utils/generateMessageId';
import { DB_INSTANCE } from './config';
import { sendMessage } from './messageListener';

export const MANIFESTS = {
  mcVersions: {},
  fabric: {},
  forge: {},
  java: [],
  addonCategories: {}
};

const readManifestsFromDisk = async () => {
  for (const manifestKey in MANIFESTS) {
    if (MANIFESTS.hasOwnProperty(manifestKey)) {
      const manifestPath = `manifests.${manifestKey}`;
      try {
        const manifest = await DB_INSTANCE.get(manifestPath);
        MANIFESTS[manifestKey] = manifest;
      } catch {
        // It's ok, we will download it after this
      }
    }
  }
};

const getManifestsFromAPIs = async () => {
  let mc = null;
  try {
    mc = (await getMcManifest()).data;
    MANIFESTS.mcVersions = mc;
  } catch (err) {
    log.error(err);
  }

  const getFabricVersions = async () => {
    const fabric = (await getFabricManifest()).data;
    MANIFESTS.fabric = fabric;
    return fabric;
  };
  const getJavaManifestVersions = async () => {
    const java = (await getJavaManifest()).data;
    MANIFESTS.java = java;
    return java;
  };
  const getAddonCategoriesVersions = async () => {
    const curseforgeCategories = (await getAddonCategories()).data;
    MANIFESTS.addonCategories = curseforgeCategories;
    return curseforgeCategories;
  };
  const getForgeVersions = async () => {
    const forge = (await getForgeManifest()).data;
    const forgeVersions = {};
    // Looping over vanilla versions, create a new entry in forge object
    // and add to it all correct versions
    mc.versions.forEach(v => {
      if (forge[v.id]) {
        forgeVersions[v.id] = forge[v.id];
      }
    });

    MANIFESTS.forge = omitBy(forgeVersions, v => v.length === 0);
    return omitBy(forgeVersions, v => v.length === 0);
  };
  // Using reflect to avoid rejection
  const [fabric, java, categories, forge] = await Promise.all([
    reflect(getFabricVersions()),
    reflect(getJavaManifestVersions()),
    reflect(getAddonCategoriesVersions()),
    reflect(getForgeVersions())
  ]);

  if (fabric.e || java.e || categories.e || forge.e) {
    log.error(fabric, java, categories, forge);
  }
};

const updateManifestsInDB = async () => {
  for (const manifestKey in MANIFESTS) {
    if (MANIFESTS.hasOwnProperty(manifestKey)) {
      const manifestPath = `manifests.${manifestKey}`;
      try {
        await DB_INSTANCE.put(manifestPath, MANIFESTS[manifestKey]);
        log.log(`Updated manifest ${manifestKey} in db`);
      } catch (e) {
        log.error(`Can't write manifest ${manifestKey} to db`, e);
      }
    }
  }
};

export default async function initializeManifests() {
  // Try to read them from disk
  await readManifestsFromDisk();
  sendMessage(EV.UPDATE_MANIFESTS_FROM_DISK, generateMessageId(), MANIFESTS);
  await getManifestsFromAPIs();
  sendMessage(EV.UPDATE_MANIFESTS_FROM_APIS, generateMessageId(), MANIFESTS);
  await updateManifestsInDB();
  log.log('Manifests initialized');
}
