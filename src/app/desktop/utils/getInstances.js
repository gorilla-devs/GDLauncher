import makeDir from "make-dir";
import path from "path";
import { getDirectories, readConfig } from ".";

const getInstances = async instancesPath => {
  const mapFolderToInstance = async instance => {
    try {
      const config = await readConfig(path.join(instancesPath, instance));
      return { name: instance, mcVersion: config.mcVersion };
    } catch (err) {
      console.error(err);
    }
    return null;
  };
  // If folder doesn't exist, create it
  makeDir(instancesPath);
  const folders = await getDirectories(instancesPath);
  const instances = await Promise.all(folders.map(mapFolderToInstance));
  return instances.filter(_ => _);
};

export default getInstances;
