import path from "path";
import { promises as fs } from "fs";
import fse from "fs-extra";
import { getDirectories } from ".";
import { getFileMurmurHash2 } from "../../../common/utils";
import { getAddonsByFingerprint } from "../../../common/api";

const checkModsIntegrity = async instancesPath => {
  const mapFolderToInstance = async instance => {
    try {
      const configPath = path.join(
        path.join(instancesPath, instance, "config.json")
      );
      const config = await fse.readJSON(configPath);

      // Check if config.mods has a different number of mods than the actual number of mods

      const modsFolder = path.join(instancesPath, instance, "mods");

      // Count the actual mods inside the folder
      const files = await fs.readdir(modsFolder);

      const fileNamesToRemove = [];
      const missingMods = {};
      /* eslint-disable */
      // Check for new mods in local storage that are not present in config
      for (const file of files) {
        const completeFilePath = path.join(modsFolder, file);
        const stat = await fs.lstat(completeFilePath);
        if (stat.isFile()) {
          // Check if file is in config
          if (!config?.mods.find(mod => mod.fileName === file)) {
            const binary = await fs.readFile(completeFilePath);
            const murmurHash = getFileMurmurHash2(binary);
            console.log("Local mod not found in config", file, murmurHash);
            missingMods[murmurHash] = file;
          }
        }
      }

      // Check for old mods in config that are not present on local storage
      for (const configMod of config.mods) {
        if (!files.includes(configMod.fileName)) {
          fileNamesToRemove.push(configMod.fileName);
        }
      }
      /* eslint-enable */

      const { data } = await getAddonsByFingerprint(Object.keys(missingMods));

      const newMods = [
        ...config.mods,
        ...data.exactMatches.map(match => ({
          ...match.file,
          fileName: missingMods[match.file.packageFingerprint]
        })),
        ...data.unmatchedFingerprints.map(hash => {
          return {
            displayName: missingMods[hash],
            fileName: missingMods[hash],
            packageFingerprint: hash
          };
        })
      ];

      const filterMods = newMods.filter(
        v => !fileNamesToRemove.includes(v.fileName)
      );

      const newConfig = {
        ...config,
        mods: filterMods
      };

      await fse.outputJson(configPath, newConfig);
    } catch (err) {
      console.error(err);
    }
  };
  const folders = await getDirectories(instancesPath);
  const instances = await Promise.all(folders.map(mapFolderToInstance));
  return instances.filter(_ => _);
};

export default checkModsIntegrity;
