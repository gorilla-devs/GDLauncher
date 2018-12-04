import axios from 'axios';
import path from 'path';
import { downloadFile } from './downloader';
import { CURSEMETA_API_URL, PACKS_PATH } from '../constants';

export const downloadMod = async (modId, projectFileId, filename, instanceName) => {

  const { data } = await axios.get(
    `${CURSEMETA_API_URL}/direct/addon/${modId}/file/${projectFileId}`
  );

  console.log(path.join(
    PACKS_PATH,
    instanceName,
    'mods',
    filename
  ));

  await downloadFile(
    path.join(
      PACKS_PATH,
      instanceName,
      'mods',
      filename
    ),
    data.downloadUrl,
    () => { }
  );
  if (data.dependencies.length !== 0) {
    const gameVersion = data.gameVersion[0];
    data.dependencies.forEach(async dep => {
      // It looks like type 1 are required dependancies and type 3 are dependancies that are already embedded in the parent one
      if (dep.type === 1) {
        const depData = await axios.get(
          `${CURSEMETA_API_URL}/direct/addon/${dep.addonId}/files`
        );
        const { id, fileNameOnDisk } = depData.data.find(n => n.gameVersion[0] === gameVersion);

        await downloadMod(dep.addonId, id, fileNameOnDisk, instanceName);
      }
    });
  }
};