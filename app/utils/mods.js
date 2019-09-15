import axios from 'axios';
import path from 'path';
import Promise from 'bluebird';
import fs from 'fs';
import makeDir from 'make-dir';
import { promisify } from 'util';
import log from 'electron-log';
import { getAddonFile, getAddon } from 'App/APIs';
import { downloadFile } from './downloader';
import { PACKS_PATH } from '../constants';

// Downloads a specific mod from curse using the addonID and fileID
export const downloadMod = async (
  // modId: The generic addon ID of the addon
  modId,
  // projectFileId: The specific id of the file to download
  projectFileId,
  // filename: A name to save the file (example.jar)
  fileName,
  // The name of the instance where to save this mod
  instanceName,
  // Is this mod part of a modpack?
  isModFromModpack
) => {
  const data = await getAddonFile(modId, projectFileId);
  const validatedFileName = fileName || data.fileName;
  const sanitizedFileName = validatedFileName.includes('.jar')
    ? validatedFileName
    : `${validatedFileName}.jar`;
  await downloadFile(
    path.join(PACKS_PATH, instanceName, 'mods', sanitizedFileName),
    data.downloadUrl,
    () => {}
  );
  return {
    projectID: modId,
    fileID: projectFileId,
    packageFingerprint: data.packageFingerprint,
    fileName: sanitizedFileName,
    fileDate: data.fileDate,
    ...(isModFromModpack && { isModFromModpack: true })
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
  const data = await getAddonFile(modId, projectFileId);
  let deps = [];
  if (data.dependencies.length !== 0) {
    const gameVersion = data.gameVersion[0];
    await Promise.all(
      data.dependencies.map(async dep => {
        // type 1: embedded
        // type 2: optional
        // type 3: required
        // type 4: tool
        // type 5: incompatible
        // type 6: include

        // It looks like type 1 are required dependancies and type 3 are dependancies that are already embedded in the parent one
        if (dep.type === 3) {
          let toDownload = true;
          try {
            // See if the mod already exists in this instance
            const installedMods = JSON.parse(
              await promisify(fs.readFile)(
                path.join(PACKS_PATH, instanceName, 'config.json')
              )
            ).mods;
            if (installedMods.find(v => v.projectID === dep.addonId)) {
              toDownload = false;
            }
          } catch {
            toDownload = true;
          }
          if (toDownload) {
            const depData = await getAddon(dep.addonId);

            const correctVersion =
              depData.gameVersionLatestFiles.find(
                v => v.gameVersion === gameVersion
              ) || {};
            const { projectFileId, projectFileName } = correctVersion;

            if (Object.keys(correctVersion).length) {
              const downloadedDep = await downloadMod(
                dep.addonId,
                projectFileId,
                projectFileName,
                instanceName
              );
              const nestedDeps = await downloadDependancies(
                dep.addonId,
                projectFileId,
                instanceName
              );
              deps = deps.concat(downloadedDep).concat(nestedDeps);
            }
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
        const { data } = await getAddonFile(mod.projectID, mod.fileID);
        return {
          path: path.join(PACKS_PATH, packName, 'mods', data.fileName),
          url: data.downloadUrl
        };
      } catch (e) {
        log.error(e);
      }
    },
    { concurrency: 20 }
  );
  return mods;
};

export const createDoNotTouchFile = async instance => {
  await makeDir(path.join(PACKS_PATH, instance, 'mods'));
  await promisify(fs.writeFile)(
    path.join(PACKS_PATH, instance, 'mods', '_README_I_AM_VERY_IMPORTANT.txt'),
    'Do not directly edit the files in this folder, if you want to delete a file or add one, use GDLauncher. \r DO NOT RENAME ANYTHING'
  );
};
