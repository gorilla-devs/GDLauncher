import axios from 'axios';
import path from 'path';
import Promise from 'bluebird';
import fs from 'fs';
import makeDir from 'make-dir';
import { promisify } from 'util';
import log from 'electron-log';
import murmur from 'murmurhash-js';
import { downloadFile } from './downloader';
import { bin2string, isWhitespaceCharacter } from './strings';
import { CURSEMETA_API_URL, PACKS_PATH } from '../constants';

// Downloads a specific mod from curse using the addonID and fileID
export const downloadMod = async (
  // modId: The generic addon ID of the addon
  modId,
  // projectFileId: The specific id of the file to download
  projectFileId,
  // filename: A name to save the file (example.jar)
  filename,
  // The name of the instance where to save this mod
  instanceName
) => {
  const { data } = await axios.get(
    `${CURSEMETA_API_URL}/direct/addon/${modId}/file/${projectFileId}`
  );
  const validatedFileName = filename !== null ? filename : data.fileNameOnDisk;
  const sanitizedFileName = validatedFileName.includes('.jar')
    ? validatedFileName
    : `${validatedFileName}.jar`;
  await downloadFile(
    path.join(PACKS_PATH, instanceName, 'mods', sanitizedFileName),
    data.downloadUrl,
    () => {}
  );
  return {
    id: modId,
    packageFingerprint: data.packageFingerprint,
    fileNameOnDisk: sanitizedFileName
  };
};

export const downloadDependancies = async (
  // modId: The generic addon ID of the addon
  modId,
  // projectFileId: The specific id of the file to download
  projectFileId,
  // The name of the instance where to save the dependancies
  instanceName
) => {
  const { data } = await axios.get(
    `${CURSEMETA_API_URL}/direct/addon/${modId}/file/${projectFileId}`
  );

  let deps = [];
  if (data.dependencies.length !== 0) {
    const gameVersion = data.gameVersion[0];
    await Promise.all(
      data.dependencies.map(async dep => {
        // It looks like type 1 are required dependancies and type 3 are dependancies that are already embedded in the parent one
        if (dep.type === 1) {
          let toDownload = true;
          try {
            // See if the mod already exists in this instance
            const installedMods = JSON.parse(
              await promisify(fs.readFile)(
                path.join(PACKS_PATH, instanceName, 'mods.json')
              )
            );
            if (installedMods.find(v => v.id === dep.addonId))
              toDownload = false;
          } catch {
            toDownload = true;
          }
          if (toDownload) {
            const depData = await axios.get(
              `${CURSEMETA_API_URL}/direct/addon/${dep.addonId}/files`
            );
            const { id, fileNameOnDisk } = depData.data.reverse().find(
              n => n.gameVersion[0] === gameVersion
            );
            const downloadedDep = await downloadMod(
              dep.addonId,
              id,
              fileNameOnDisk,
              instanceName
            );
            deps = deps.concat(downloadedDep);
          }
        }
      })
    );
  }
  return deps;
};

export const getModsList = async (
  // An array of the mods to look up. Every value must be an Object containing "projectID" and "fileID" keys
  modsArr,
  // The instance name where to eventually save this file to
  packName
) => {
  // Curse metafile already contains all the dependancies so no check for
  // that is needed.
  const mods = await Promise.map(
    modsArr,
    async mod => {
      try {
        const { data } = await axios.get(
          `${CURSEMETA_API_URL}/direct/addon/${mod.projectID}/file/${
            mod.fileID
          }`
        );
        return {
          path: path.join(PACKS_PATH, packName, 'mods', data.fileNameOnDisk),
          url: data.downloadUrl
        };
      } catch (e) {
        log.error(e);
      }
    },
    { concurrency: 4 }
  );
  return mods;
};

// Create the murmur hash of a mod
export const getModMurmurHash2 = async modPath => {
  const file = await promisify(fs.readFile)(modPath);
  return murmur.murmur2(bin2string(file), 1);
};

export const createDoNotTouchFile = async instance => {
  await makeDir(path.join(PACKS_PATH, instance, 'mods'));
  await promisify(fs.writeFile)(
    path.join(PACKS_PATH, instance, 'mods', '_DO_NOT_TOUCH_THIS_FOLDER.txt'),
    'Do not directly edit the files in this folder, if you want to delete a file or add one, use GDLauncher. \r DO NOT RENAME ANYTHING'
  );
};
