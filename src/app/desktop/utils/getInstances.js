import path from 'path';
import fse from 'fs-extra';
import pMap from 'p-map';
import { getDirectories } from '.';

const getInstances = async instancesPath => {
  const mapFolderToInstance = async instance => {
    try {
      const configPath = path.join(
        path.join(instancesPath, instance, 'config.json')
      );
      const config = await fse.readJSON(configPath);
      if (!config.modloader) {
        throw new Error(`Config for ${instance} could not be parsed`);
      }

      return {
        ...config,
        name: instance
      };
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

export default getInstances;
