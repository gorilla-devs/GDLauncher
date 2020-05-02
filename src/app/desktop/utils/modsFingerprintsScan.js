import path from 'path';
import { promises as fs } from 'fs';
import fse from 'fs-extra';
import pMap from 'p-map';
import { getDirectories, normalizeModData, isMod } from '.';
import { getFileMurmurHash2 } from '../../../common/utils';
import { getAddonsByFingerprint, getAddon } from '../../../common/api';

const modsFingerprintsScan = async instancesPath => {
  const mapFolderToInstance = async instance => {
    try {
      const configPath = path.join(
        path.join(instancesPath, instance, 'config.json')
      );
      const config = await fse.readJSON(configPath);

      if (!config.modloader) {
        throw new Error(`Config for ${instance} could not be parsed`);
      }

      const modsFolder = path.join(instancesPath, instance, 'mods');
      const modsFolderExists = await fse.pathExists(modsFolder);

      if (!modsFolderExists) return { ...config, name: instance };

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
            if (!(config?.mods || []).find(mod => mod.fileName === file)) {
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
      for (const configMod of config?.mods || []) {
        if (!files.includes(configMod.fileName)) {
          fileNamesToRemove.push(configMod.fileName);
          console.log(
            `[MODS SCANNER] Removing ${configMod.fileName} from config`
          );
        }
      }
      /* eslint-enable */

      let newMods = config?.mods || [];

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
              const { data: addonData } = await getAddon(
                exactMatch.file.projectId
              );
              return {
                ...normalizeModData(
                  exactMatch.file,
                  exactMatch.file.projectId,
                  addonData.name,
                  addonData.categorySection
                ),
                fileName
              };
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
        await fse.outputJson(configPath, newConfig);
        return { ...newConfig, name: instance };
      }
      return { ...config, name: instance };
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
    hashMap[instance.name] = instance;
  }

  return hashMap;
};

export default modsFingerprintsScan;
