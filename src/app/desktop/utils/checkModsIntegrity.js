import path from "path";
import { promises as fs } from "fs";
import fse from "fs-extra";
import { getDirectories } from ".";

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

      let currentMods = 0;
      /* eslint-disable */
      for (const file of files) {
        const stat = await fs.lstat(path.join(modsFolder, file));
        if (stat.isFile()) {
          currentMods += 1;
        }
      }
      /* eslint-enable */

      // Need to check for missing mods
      if (currentMods !== Object.keys(config.mods).length) {
        console.log();
      }

      return { name: instance, modloader: config.modloader, mods: config.mods };
    } catch (err) {
      console.error(err);
    }
    return null;
  };
  const folders = await getDirectories(instancesPath);
  const instances = await Promise.all(folders.map(mapFolderToInstance));
  return instances.filter(_ => _);
};

export default checkModsIntegrity;
