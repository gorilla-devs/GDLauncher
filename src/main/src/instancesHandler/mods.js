import pMap from 'p-map';
import { promises as fs } from 'fs';
import path from 'path';
import { getAddon, getAddonFile, getAddonFiles } from '../../../common/api';
import { normalizeModData, sortByDate } from '../../../common/utils';
import { downloadFile } from '../../../common/utils/downloader';
import { INSTANCES, updateInstance } from './instances';
import { getFileMurmurHash2 } from '../helpers';
import { INSTANCES_PATH, TEMP_PATH } from '../config';

export const toggleModDisabled = async ([oldFileName, destFileName, uid]) => {
  const instancePath = path.join(INSTANCES_PATH, uid);

  INSTANCES[uid].mods = INSTANCES[uid].mods.map(m => {
    if (m.fileName === oldFileName) {
      return {
        ...m,
        fileName: destFileName
      };
    }
    return m;
  });

  await fs.rename(
    path.join(instancePath, 'mods', oldFileName),
    path.join(instancePath, 'mods', destFileName)
  );
  updateInstance(uid);
};

export const deleteMods = async ([uid, selectedMods]) => {
  const instancePath = path.join(INSTANCES_PATH, uid);

  INSTANCES[uid].mods = INSTANCES[uid].mods.filter(
    m => !selectedMods.includes(m.fileName)
  );

  await Promise.all(
    selectedMods.map(fileName =>
      fs.unlink(path.join(instancePath, 'mods', fileName))
    )
  );

  updateInstance(uid);
};

export const installMod = async ([
  projectID,
  fileID,
  uid,
  gameVersion,
  installDeps = true,
  onProgress,
  useTempMiddleware
]) => {
  const instancePath = path.join(INSTANCES_PATH, uid);

  const instance = INSTANCES[uid];
  const mainModData = await getAddonFile(projectID, fileID);
  const { data: addon } = await getAddon(projectID);
  mainModData.data.projectID = projectID;
  const destFile = path.join(instancePath, 'mods', mainModData.data.fileName);
  const tempFile = path.join(TEMP_PATH, mainModData.data.fileName);

  if (useTempMiddleware) {
    await downloadFile(tempFile, mainModData.data.downloadUrl, onProgress);
  }

  const needToAddMod = !instance.mods.find(
    v => v.fileID === fileID && v.projectID === projectID
  );

  if (needToAddMod) {
    instance.mods.push(
      normalizeModData(mainModData.data, projectID, addon.name)
    );
  }

  updateInstance(uid);

  if (!needToAddMod) {
    if (useTempMiddleware) {
      await fs.unlink(tempFile);
    }
    return;
  }

  if (!useTempMiddleware) {
    try {
      await fs.lstat(destFile);
      const murmur2 = await getFileMurmurHash2(destFile);
      if (murmur2 !== mainModData.data.packageFingerprint) {
        await downloadFile(destFile, mainModData.data.downloadUrl, onProgress);
      }
    } catch {
      await downloadFile(destFile, mainModData.data.downloadUrl, onProgress);
    }
  } else {
    await fs.rename(tempFile, destFile);
  }

  if (installDeps) {
    await pMap(
      mainModData.data.dependencies,
      async dep => {
        // type 1: embedded
        // type 2: optional
        // type 3: required
        // type 4: tool
        // type 5: incompatible
        // type 6: include

        if (dep.type === 3) {
          if (instance.mods.some(x => x.projectID === dep.addonId)) return;
          const depList = (await getAddonFiles(dep.addonId)).data.sort(
            sortByDate
          );
          const depData = depList.find(v =>
            v.gameVersion.includes(gameVersion)
          );
          await installMod([
            dep.addonId,
            depData.id,
            uid,
            gameVersion,
            installDeps,
            onProgress,
            useTempMiddleware
          ]);
        }
      },
      { concurrency: 2 }
    );
  }
  return mainModData.data.fileName;
};

export const updateMod = async ([
  uid,
  mod,
  fileID,
  gameVersion,
  onProgress
]) => {
  await installMod([
    mod.projectID,
    fileID,
    uid,
    gameVersion,
    false,
    onProgress,
    true
  ]);
  await deleteMods([uid, [mod.fileName]]);
};
