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

      // if the launcher has the modloader as an array, convert it to object
      if (Array.isArray(config.modloader)) {
        // source is the source where the modpack comes from example: ftb
        // loaderType is the modloader example: forge
        const [
          loaderType,
          mcVersion,
          loaderVersion,
          fileId,
          addonId,
          source
        ] = config.modloader;

        const patchedConfig = {
          ...config,
          loader: {
            loaderType,
            mcVersion,
            ...(loaderVersion && { loaderVersion }),
            ...(fileId && { fileID: fileId }),
            ...(addonId && { projectID: addonId }),
            ...(source && { source })
          }
        };

        await fse.writeFile(configPath, JSON.stringify(patchedConfig));

        return { ...patchedConfig, name: instance };
      }

      if (config.loader?.fileId || config.loader?.addonId) {
        const { fileId, addonId } = config.loader;

        const patchedConfig = {
          ...config,
          loader: {
            ...config.loader,
            ...(fileId && { fileID: fileId }),
            ...(addonId && { projectID: addonId })
          }
        };

        delete patchedConfig.loader.fileId;
        delete patchedConfig.loader.addonId;

        await fse.writeFile(configPath, JSON.stringify(patchedConfig));

        return { ...patchedConfig, name: instance };
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
