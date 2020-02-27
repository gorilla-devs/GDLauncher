import path from "path";
import { promises as fs } from "fs";
import fse from "fs-extra";
import lockfile from "lockfile";
import pMap from "p-map";
import { getDirectories } from ".";
import { getFileMurmurHash2 } from "../../../common/utils";
import { getAddonsByFingerprint } from "../../../common/api";

const modsFingerprintsScan = async (instancesPath, events) => {
  const mapFolderToInstance = async instance => {
    try {
      const configPath = path.join(
        path.join(instancesPath, instance, "config.json")
      );
      const config = await fse.readJSON(configPath);

      const isLocked = await new Promise((resolve, reject) => {
        lockfile.check(
          path.join(instancesPath, instance, "installing.lock"),
          (err, locked) => {
            if (err) reject(err);
            resolve(locked);
          }
        );
      });

      if (isLocked) return { ...config, name: instance };

      // Check if config.mods has a different number of mods than the actual number of mods

      const modsFolder = path.join(instancesPath, instance, "mods");

      const mapEventFiles = ev => {
        return (
          Array.isArray(events) &&
          events.length !== 0 &&
          events
            .filter(event => event[0] === ev && event[1].includes(modsFolder))
            .map(event => path.basename(event[1]))
        );
      };

      const eventFiles = mapEventFiles("update");

      // Count the actual mods inside the folder
      const files = eventFiles || (await fs.readdir(modsFolder));

      const fileNamesToRemove = mapEventFiles("remove") || [];
      const missingMods = {};
      /* eslint-disable */
      // Check for new mods in local storage that are not present in config
      for (const file of files) {
        const completeFilePath = path.join(modsFolder, file);
        const stat = await fs.lstat(completeFilePath);
        if (stat.isFile()) {
          // 15728640 = 15mb
          if (stat.size < 15728640) {
            // Check if file is in config
            if (!(config?.mods || []).find(mod => mod.fileName === file)) {
              const binary = await fs.readFile(completeFilePath);
              const murmurHash = getFileMurmurHash2(binary);
              console.log(
                "[MODS SCANNER] Local mod not found in config",
                file,
                murmurHash
              );
              missingMods[file] = murmurHash;
            }
          } else {
            console.warn(
              `[MODS SCANNER] Local mod too big (${Number.parseInt(
                stat.size / 1024 / 1024,
                10
              )}MB). Cannot analyze. If you manually copied it in the mods folder, please delete it and install it from GDLauncher instead.`,
              file
            );
          }
        }
      }

      // Check for old mods in config that are not present on local storage
      if (!eventFiles) {
        for (const configMod of config?.mods || []) {
          if (!files.includes(configMod.fileName)) {
            fileNamesToRemove.push(configMod.fileName);
          }
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

      const updatedConfig = await fse.readJSON(configPath);
      if (JSON.stringify(updatedConfig) === JSON.stringify(config)) {
        await fse.outputJson(configPath, newConfig);
        return { ...newConfig, name: instance };
      }
      return updatedConfig;
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
