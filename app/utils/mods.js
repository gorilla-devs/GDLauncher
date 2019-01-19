import axios from 'axios';
import path from 'path';
import { downloadFile } from './downloader';
import Promise from 'bluebird';
import { CURSEMETA_API_URL, PACKS_PATH, INSTANCES_PATH } from '../constants';

export const downloadMod = async (modId, projectFileId, filename, instanceName) => {

  const { data } = await axios.get(
    `${CURSEMETA_API_URL}/direct/addon/${modId}/file/${projectFileId}`
  );
  const validatedFileName = filename !== null ? filename : data.fileNameOnDisk;
  const sanitizedFileName = validatedFileName.includes('.jar') ? validatedFileName : `${validatedFileName}.jar`;
  await downloadFile(
    path.join(
      PACKS_PATH,
      instanceName,
      'mods',
      sanitizedFileName
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

export const getModsList = async (modsArr, packName) => {
  // Curse metafile already contains all the dependancies so no check for
  // that is needed.
  const mods = await Promise.map(modsArr, async mod => {
    const { data } = await axios.get(`${CURSEMETA_API_URL}/direct/addon/${mod.projectID}/file/${mod.fileID}`);
    return { path: path.join(PACKS_PATH, packName, 'mods', data.fileNameOnDisk), url: data.downloadUrl };
  }, { concurrency: 4 });
  return mods;
};