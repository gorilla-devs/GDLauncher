import makeDir from "make-dir";
import path from "path";
import fse from "fs-extra";
import { getDirectories } from ".";

const getInstances = async instancesPath => {
  const mapFolderToInstance = async instance => {
    try {
      const configPath = path.join(
        path.join(instancesPath, instance, "config.json")
      );
      const config = await fse.readJSON(configPath);

      return {
        name: instance,
        modloader: config.modloader,
        mods: config.mods,
        background: config.background
      };
    } catch (err) {
      console.error(err);
    }
    return null;
  };
  // If folder doesn't exist, create it
  await makeDir(instancesPath);
  const folders = await getDirectories(instancesPath);
  const instances = await Promise.all(folders.map(mapFolderToInstance));
  return instances.filter(_ => _);
};

export default getInstances;
