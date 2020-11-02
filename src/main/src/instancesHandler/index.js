import path from 'path';
import { app } from 'electron';
import log from 'electron-log';
import { promises as fs } from 'fs';
import makeDir from 'make-dir';
import pMap from 'p-map';
import { getAddon, getAddonsByFingerprint } from '../../../common/api';
import { isMod, normalizeModData } from '../../../common/utils';
import { sendMessage } from '../messageListener';
import EV from '../../../common/messageEvents';
import generateMessageId from '../../../common/utils/generateMessageId';
import startListener from './watcher';
import { getInstanceDB, INSTANCES } from './instances';
import { getFileMurmurHash2 } from '../helpers';

const assignInstances = data => {
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      INSTANCES[key] = data[key];
    }
  }
};

const initializeInstances = async () => {
  try {
    const instancesPath = path.join(app.getPath('userData'), 'instances');
    await makeDir(instancesPath);
    // Initially read from disk
    let instances = await getInstances(instancesPath);
    assignInstances(instances);
    sendMessage(EV.UPDATE_INSTANCES, generateMessageId(), INSTANCES);
    instances = await modsFingerprintsScan(instancesPath);
    assignInstances(instances);
    sendMessage(EV.UPDATE_INSTANCES, generateMessageId(), INSTANCES);

    // Initialize listener
    await startListener(instancesPath);
  } catch (err) {
    log.error(err);
  }
};

const isDirectory = source => fs.lstat(source).then(r => r.isDirectory());

const getDirectories = async source => {
  const dirs = await fs.readdir(source);
  return Promise.all(
    dirs
      .map(name => path.join(source, name))
      .filter(isDirectory)
      .map(dir => path.basename(dir))
  );
};

const getInstances = async instancesPath => {
  const mapFolderToInstance = async uid => {
    try {
      const config = await getInstanceDB(uid).get(`config`);
      if (!config.modloader) {
        throw new Error(`Config for ${uid} could not be parsed`);
      }

      return config;
    } catch (err) {
      console.error(err);
    }
    return null;
  };
  const folders = await getDirectories(instancesPath);
  const instances = await pMap(folders, mapFolderToInstance, {
    concurrency: 5
  });
  const hashMap = {};
  // eslint-disable-next-line
  for (const instance of instances) {
    // eslint-disable-next-line
    if (!instance) continue;
    hashMap[instance.uid] = instance;
  }

  return hashMap;
};

const modsFingerprintsScan = async instancesPath => {
  const mapFolderToInstance = async uid => {
    try {
      const config = await getInstanceDB(uid).get(`config`);

      if (!config.modloader) {
        throw new Error(`Config for ${uid} could not be parsed`);
      }

      const modsFolder = path.join(instancesPath, uid, 'mods');

      let modsFolderExists;
      try {
        await fs.access(modsFolder);
        modsFolderExists = true;
      } catch {
        modsFolderExists = false;
      }

      if (!modsFolderExists) return config;

      // Check if config.mods has a different number of mods than the actual number of mods

      // Count the actual mods inside the folder
      const files = await fs.readdir(modsFolder);

      const fileNamesToRemove = [];
      const missingMods = {};
      /* eslint-disable */
      // Check for new mods in local storage that are not present in config
      for (const file of files) {
        try {
          const completeFilePath = path.join(modsFolder, file);
          const stat = await fs.lstat(completeFilePath);
          if (stat.isFile() && isMod(completeFilePath, instancesPath)) {
            // Check if file is in config
            if (!(config.mods || []).find(mod => mod.fileName === file)) {
              const murmurHash = await getFileMurmurHash2(completeFilePath);
              console.log(
                '[MODS SCANNER] Local mod not found in config',
                file,
                murmurHash
              );
              missingMods[file] = murmurHash;
            }
          }
        } catch {}
      }

      // Check for old mods in config that are not present on local storage
      for (const configMod of config.mods || []) {
        if (!files.includes(configMod.fileName)) {
          fileNamesToRemove.push(configMod.fileName);
          console.log(
            `[MODS SCANNER] Removing ${configMod.fileName} from config`
          );
        }
      }
      /* eslint-enable */

      let newMods = config.mods || [];

      if (Object.values(missingMods).length !== 0) {
        const { data } = await getAddonsByFingerprint(
          Object.values(missingMods)
        );

        const matches = await Promise.all(
          Object.entries(missingMods).map(async ([fileName, hash]) => {
            const exactMatch = (data.exactMatches || []).find(
              v => v.file.packageFingerprint === hash
            );
            const unmatched = (data.unmatchedFingerprints || []).find(
              v => v === hash
            );
            if (exactMatch) {
              let addonData = null;
              try {
                addonData = (await getAddon(exactMatch.file.projectId)).data;
                return {
                  ...normalizeModData(
                    exactMatch.file,
                    exactMatch.file.projectId,
                    addonData.name
                  ),
                  fileName
                };
              } catch {
                return {
                  fileName,
                  displayName: fileName,
                  packageFingerprint: hash
                };
              }
            }
            if (unmatched) {
              return {
                fileName,
                displayName: fileName,
                packageFingerprint: hash
              };
            }
            return null;
          })
        );

        newMods = [...newMods, ...matches];
      }

      const filterMods = newMods
        .filter(_ => _)
        .filter(v => !fileNamesToRemove.includes(v.fileName));

      const newConfig = {
        ...config,
        mods: filterMods
      };

      if (JSON.stringify(config) !== JSON.stringify(newConfig)) {
        await getInstanceDB(uid).put(`config`, newConfig);
      }
      return newConfig;
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  const instances = await pMap(Object.keys(INSTANCES), mapFolderToInstance, {
    concurrency: 5
  });
  const hashMap = {};
  // eslint-disable-next-line
  for (const instance of instances) {
    // eslint-disable-next-line
    if (!instance) continue;
    hashMap[instance.uid] = instance;
  }

  return hashMap;
};

export default initializeInstances;
