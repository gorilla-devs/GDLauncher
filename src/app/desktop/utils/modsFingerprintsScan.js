import path from "path";
import { promises as fs } from "fs";
import fse from "fs-extra";
import pMap from "p-map";
import { getDirectories } from ".";
import { getFileMurmurHash2 } from "../../../common/utils";
import { getAddonsByFingerprint } from "../../../common/api";

const modsFingerprintsScan = async (instancesPath, tempFolder) => {
  const mapFolderToInstance = async instance => {
    try {
      const configPath = path.join(
        path.join(instancesPath, instance, "config.json")
      );
      const config = await fse.readJSON(configPath);
      const modsFolder = path.join(instancesPath, instance, "mods");
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
          if (stat.isFile()) {
            // Check if file is in config
            if (!(config?.mods || []).find(mod => mod.fileName === file)) {
              const murmurHash = await getFileMurmurHash2(
                completeFilePath,
                tempFolder
              );
              console.log(
                "[MODS SCANNER] Local mod not found in config",
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
          console.log(`[MODS SCANNER] Removing ${configMod.fileName}`);
        }
      }
      /* eslint-enable */

      let newMods = config?.mods || [];

      if (Object.values(missingMods).length !== 0) {
        const { data } = await getAddonsByFingerprint(
          Object.values(missingMods)
        );

        newMods = [
          ...newMods,
          ...Object.entries(missingMods).map(([fileName, hash]) => {
            const exactMatch = (data.exactMatches || []).find(
              v => v.file.packageFingerprint === hash
            );
            const unmatched = (data.unmatchedFingerprints || []).find(
              v => v === hash
            );
            if (exactMatch) {
              return {
                ...exactMatch.file,
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
        ];
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
