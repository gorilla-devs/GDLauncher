import axios from 'axios';
import path from 'path';
import { ipcRenderer } from 'electron';
import uuid from 'uuid/v1';
import fse from 'fs-extra';
import coerce from 'semver/functions/coerce';
import gte from 'semver/functions/gte';
import lt from 'semver/functions/lt';
import omitBy from 'lodash.omitby';
import lockfile from 'lockfile';
import omit from 'lodash.omit';
import { extractFull } from 'node-7z';
import { push } from 'connected-react-router';
import { spawn } from 'child_process';
import symlink from 'symlink-dir';
import { promises as fs } from 'fs';
import pMap from 'p-map';
import { notification, message } from 'antd';
import makeDir from 'make-dir';
import * as ActionTypes from './actionTypes';
import {
  NEWS_URL,
  MC_RESOURCES_URL,
  GDL_LEGACYJAVAFIXER_MOD_URL,
  FORGE,
  FABRIC
} from '../utils/constants';
import {
  mcAuthenticate,
  mcRefresh,
  mcInvalidate,
  getFabricManifest,
  getMcManifest,
  getForgeManifest,
  mcValidate,
  getFabricJson,
  getForgeJson,
  getAddonFile,
  getJavaManifest,
  getAddonsByFingerprint,
  getAddonFiles,
  getAddon,
  getAddonCategories
} from '../api';
import {
  _getCurrentAccount,
  _getCurrentDownloadItem,
  _getJavaPath,
  _getMinecraftVersionsPath,
  _getAssetsPath,
  _getInstancesPath,
  _getLibrariesPath,
  _getAccounts,
  _getTempPath,
  _getInstance,
  _getDataStorePath
} from '../utils/selectors';
import {
  librariesMapper,
  get7zPath,
  fixFilePermissions,
  extractNatives,
  getJVMArguments112,
  copyAssetsToResources,
  getJVMArguments113,
  patchForge113,
  mavenToArray,
  copyAssetsToLegacy,
  convertOSToJavaFormat,
  getPlayerSkin,
  normalizeModData,
  reflect,
  isMod,
  isInstanceFolderPath
} from '../../app/desktop/utils';
import {
  downloadFile,
  downloadInstanceFiles
} from '../../app/desktop/utils/downloader';
import { removeDuplicates, getFileMurmurHash2 } from '../utils';
import { UPDATE_CONCURRENT_DOWNLOADS } from './settings/actionTypes';
import { UPDATE_MODAL } from './modals/actionTypes';
import PromiseQueue from '../../app/desktop/utils/PromiseQueue';

export function initManifests() {
  return async (dispatch, getState) => {
    const { app } = getState();
    let mc = null;
    try {
      mc = (await getMcManifest()).data;
      dispatch({
        type: ActionTypes.UPDATE_VANILLA_MANIFEST,
        data: mc
      });
    } catch (err) {
      console.error(err);
    }

    const getFabricVersions = async () => {
      const fabric = (await getFabricManifest()).data;
      dispatch({
        type: ActionTypes.UPDATE_FABRIC_MANIFEST,
        data: fabric
      });
      return fabric;
    };
    const getJavaManifestVersions = async () => {
      const java = (await getJavaManifest()).data;
      dispatch({
        type: ActionTypes.UPDATE_JAVA_MANIFEST,
        data: java
      });
      return java;
    };
    const getAddonCategoriesVersions = async () => {
      const curseforgeCategories = (await getAddonCategories()).data;
      dispatch({
        type: ActionTypes.UPDATE_CURSEFORGE_CATEGORIES_MANIFEST,
        data: curseforgeCategories
      });
      return curseforgeCategories;
    };
    const getForgeVersions = async () => {
      const forge = removeDuplicates((await getForgeManifest()).data, 'name');
      const forgeVersions = {};
      // Looping over vanilla versions, create a new entry in forge object
      // and add to it all correct versions
      mc.versions.forEach(v => {
        forgeVersions[v.id] = forge
          .filter(
            ver =>
              ver.gameVersion === v.id &&
              gte(coerce(ver.gameVersion), coerce('1.6.1'))
          )
          .map(ver => ver.name.replace('forge-', ''));
      });

      dispatch({
        type: ActionTypes.UPDATE_FORGE_MANIFEST,
        data: omitBy(forgeVersions, v => v.length === 0)
      });
      return omitBy(forgeVersions, v => v.length === 0);
    };
    // Using reflect to avoid rejection
    const [fabric, java, categories, forge] = await Promise.all([
      reflect(getFabricVersions()),
      reflect(getJavaManifestVersions()),
      reflect(getAddonCategoriesVersions()),
      reflect(getForgeVersions())
    ]);

    return {
      mc: mc.status ? mc.v : app.vanillaManifest,
      fabric: fabric.status ? fabric.v : app.fabricManifest,
      java: java.status ? java.v : app.javaManifest,
      categories: categories.status ? categories.v : app.curseforgeCategories,
      forge: forge.status ? forge.v : app.forgeManifest
    };
  };
}

export function initNews() {
  return async (dispatch, getState) => {
    const {
      news,
      loading: { minecraftNews }
    } = getState();
    if (news.length === 0 && !minecraftNews.isRequesting) {
      try {
        const res = await axios.get(NEWS_URL);
        const newsArr = await Promise.all(
          res.data.article_grid.map(async item => {
            return {
              title: item.default_tile.title,
              description: item.default_tile.sub_header,
              // We need to get the header image of every article, since
              // the ones present in this json are thumbnails
              image: `https://minecraft.net${item.default_tile.image.imageURL}`,
              url: `https://minecraft.net${item.article_url}`
            };
          })
        );
        dispatch({
          type: ActionTypes.UPDATE_NEWS,
          news: newsArr.splice(0, 12)
        });
      } catch (err) {
        console.error(err.message);
      }
    }
  };
}

export function updateAccount(uuidVal, account) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_ACCOUNT,
      id: uuidVal,
      account
    });
  };
}

export function switchToFirstValidAccount(id) {
  return async (dispatch, getState) => {
    const state = getState();
    const accounts = _getAccounts(state);
    const currentAccountId = id || state.app.currentAccountId;
    let found = null;
    for (let i = 0; i < accounts.length; i += 1) {
      if (found || accounts[i].selectedProfile.id === currentAccountId)
        continue; //eslint-disable-line
      try {
        dispatch(updateCurrentAccountId(accounts[i].selectedProfile.id));
        // eslint-disable-next-line no-await-in-loop
        await dispatch(loginWithAccessToken());
        found = accounts[i].selectedProfile.id;
      } catch {
        dispatch(
          updateAccount(accounts[i].selectedProfile.id, {
            ...accounts[i],
            accessToken: accounts[i].accessToken
          })
        );
        console.error(`Failed to validate ${accounts[i].selectedProfile.id}`);
      }
    }
    if (!found) {
      dispatch(updateCurrentAccountId(null));
    }
    return found;
  };
}

export function removeAccount(id) {
  return async (dispatch, getState) => {
    const state = getState();
    const { currentAccountId } = state.app;
    let newId = id;
    if (currentAccountId === id) {
      newId = await dispatch(switchToFirstValidAccount(id));
    }
    dispatch({
      type: ActionTypes.REMOVE_ACCOUNT,
      id
    });
    return newId;
  };
}

export function updateIsNewUser(isNewUser) {
  return async dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_IS_NEW_USER,
      isNewUser
    });
  };
}

export function updateCurrentAccountId(id) {
  return async dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_CURRENT_ACCOUNT_ID,
      id
    });
  };
}

export function updateConcurrentDownloads(concurrentDownloads) {
  return async dispatch => {
    dispatch({
      type: UPDATE_CONCURRENT_DOWNLOADS,
      concurrentDownloads
    });
  };
}

export function updateUpdateAvailable(updateAvailable) {
  return async dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_UPDATE_AVAILABLE,
      updateAvailable
    });
  };
}

export function updateDownloadProgress(percentage) {
  return (dispatch, getState) => {
    const { currentDownload } = getState();
    dispatch({
      type: ActionTypes.UPDATE_DOWNLOAD_PROGRESS,
      instanceName: currentDownload,
      percentage: Number(percentage.toFixed())
    });
  };
}

export function downloadJavaLegacyFixer() {
  return async (dispatch, getState) => {
    const state = getState();
    await downloadFile(
      path.join(_getDataStorePath(state), '__JLF__.jar'),
      GDL_LEGACYJAVAFIXER_MOD_URL
    );
  };
}

export function downloadJava() {
  return async (dispatch, getState) => {
    const state = getState();
    const {
      app: { javaManifest },
      settings: { dataPath }
    } = state;
    const javaOs = convertOSToJavaFormat(process.platform);
    const javaMeta = javaManifest.find(v => v.os === javaOs);
    const {
      version_data: { openjdk_version: version },
      binary_link: url,
      release_name: releaseName
    } = javaMeta;
    const javaBaseFolder = path.join(dataPath, 'java');
    const tempFolder = _getTempPath(state);
    await fse.remove(javaBaseFolder);
    const downloadLocation = path.join(tempFolder, path.basename(url));

    const notificationObj = {
      key: 'javaDownload',
      message: 'Preparing Java',
      top: 47,
      duration: 0,
      closeIcon: []
    };

    let i = 0;
    await downloadFile(downloadLocation, url, p => {
      if (i % 4 === 0) {
        ipcRenderer.invoke('update-progress-bar', parseInt(p, 10) / 100);
        notification.open({
          ...notificationObj,
          description: `Downloading: ${parseInt(p, 10)}%`
        });
      }
      i += 1;
    });

    const totalSteps = process.platform !== 'win32' ? 2 : 1;

    notification.open({
      ...notificationObj,
      description: `Extracting (1 / ${totalSteps})`
    });
    const sevenZipPath = await get7zPath();
    const firstExtraction = extractFull(downloadLocation, tempFolder, {
      $bin: sevenZipPath
    });
    await new Promise((resolve, reject) => {
      firstExtraction.on('end', () => {
        resolve();
      });
      firstExtraction.on('error', err => {
        reject(err);
      });
    });

    // If NOT windows then tar.gz instead of zip, so we need to extract 2 times.
    if (process.platform !== 'win32') {
      notification.open({
        ...notificationObj,
        description: `Extracting (2 / ${totalSteps})`
      });
      const tempTarName = path.join(
        tempFolder,
        path.basename(url).replace('.tar.gz', '.tar')
      );
      const secondExtraction = extractFull(tempTarName, tempFolder, {
        $bin: sevenZipPath
      });
      await new Promise((resolve, reject) => {
        secondExtraction.on('end', () => {
          resolve();
        });
        secondExtraction.on('error', err => {
          reject(err);
        });
      });
    }

    const directoryToMove =
      process.platform === 'darwin'
        ? path.join(tempFolder, `${releaseName}-jre`, 'Contents', 'Home')
        : path.join(tempFolder, `${releaseName}-jre`);

    await fse.move(directoryToMove, path.join(javaBaseFolder, version));

    await fse.remove(tempFolder);

    const ext = process.platform === 'win32' ? '.exe' : '';
    await fixFilePermissions(
      path.join(javaBaseFolder, version, 'bin', `java${ext}`)
    );

    ipcRenderer.invoke('update-progress-bar', -1);

    notification.open({
      ...notificationObj,
      description: 'Java is ready!'
    });
    setTimeout(() => notification.close('javaDownload'), 2000);
  };
}

export function login(username, password, redirect = true) {
  return async (dispatch, getState) => {
    const {
      app: { isNewUser, clientToken }
    } = getState();
    if (!username || !password) {
      throw new Error('No username or password provided');
    }
    try {
      const { data } = await mcAuthenticate(username, password, clientToken);
      const skinUrl = await getPlayerSkin(data.selectedProfile.id);
      if (skinUrl) {
        data.skin = skinUrl;
      }
      dispatch(updateAccount(data.selectedProfile.id, data));
      dispatch(updateCurrentAccountId(data.selectedProfile.id));

      if (!isNewUser) {
        if (redirect) {
          dispatch(push('/home'));
        }
      } else {
        dispatch(updateIsNewUser(false));
        if (redirect) {
          dispatch(push('/onboarding'));
        }
      }
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }
  };
}

export function loginWithAccessToken(redirect = true) {
  return async (dispatch, getState) => {
    const state = getState();
    const currentAccount = _getCurrentAccount(state);
    const { accessToken, clientToken, selectedProfile } = currentAccount;
    if (!accessToken) throw new Error();
    try {
      await mcValidate(accessToken, clientToken);
      const skinUrl = await getPlayerSkin(selectedProfile.id);
      if (skinUrl) {
        dispatch(
          updateAccount(selectedProfile.id, {
            ...currentAccount,
            skin: skinUrl
          })
        );
      }
      dispatch(push('/home'));
    } catch (error) {
      console.error(error);
      // Trying refreshing the stored access token
      if (error.response && error.response.status === 403) {
        try {
          const { data } = await mcRefresh(accessToken, clientToken);
          const skinUrl = await getPlayerSkin(data.selectedProfile.id);
          if (skinUrl) {
            data.skin = skinUrl;
          }
          dispatch(updateAccount(data.selectedProfile.id, data));
          dispatch(updateCurrentAccountId(data.selectedProfile.id));
          if (redirect) {
            dispatch(push('/home'));
          }
        } catch (nestedError) {
          console.error(error, nestedError);
          if (redirect) {
            dispatch(push('/'));
          }
          throw new Error();
        }
      } else if (error.message === 'Network Error') {
        if (redirect) {
          dispatch(push('/home'));
        }
      }
    }
  };
}

export function loginThroughNativeLauncher() {
  return async (dispatch, getState) => {
    const {
      app: { isNewUser }
    } = getState();

    const homedir = await ipcRenderer.invoke('getAppdataPath');
    const mcFolder = process.platform === 'darwin' ? 'minecraft' : '.minecraft';
    const vanillaMCPath = path.join(homedir, mcFolder);
    const vnlJson = await fse.readJson(
      path.join(vanillaMCPath, 'launcher_profiles.json')
    );

    try {
      const { clientToken } = vnlJson;
      const { account } = vnlJson.selectedUser;
      const { accessToken } = vnlJson.authenticationDatabase[account];

      const { data } = await mcRefresh(accessToken, clientToken);
      const skinUrl = await getPlayerSkin(data.selectedProfile.id);
      if (skinUrl) {
        data.skin = skinUrl;
      }

      // We need to update the accessToken in launcher_profiles.json
      vnlJson.authenticationDatabase[account].accessToken = data.accessToken;
      await fse.writeJson(
        path.join(vanillaMCPath, 'launcher_profiles.json'),
        vnlJson
      );

      dispatch(updateAccount(data.selectedProfile.id, data));
      dispatch(updateCurrentAccountId(data.selectedProfile.id));

      if (isNewUser) {
        dispatch(updateIsNewUser(false));
        dispatch(push('/onboarding'));
      } else {
        dispatch(push('/home'));
      }
    } catch (err) {
      throw new Error(err);
    }
  };
}

export function logout() {
  return (dispatch, getState) => {
    const state = getState();
    const {
      clientToken,
      accessToken,
      selectedProfile: { id }
    } = _getCurrentAccount(state);
    mcInvalidate(accessToken, clientToken).catch(console.error);
    dispatch(removeAccount(id));
    dispatch(push('/'));
  };
}

export function checkClientToken() {
  return (dispatch, getState) => {
    const {
      app: { clientToken }
    } = getState();
    if (clientToken) return clientToken;
    const newToken = uuid()
      .split('')
      .filter(v => v !== '-')
      .join('');
    dispatch({
      type: ActionTypes.UPDATE_CLIENT_TOKEN,
      clientToken: newToken
    });
    return newToken;
  };
}

export function updateModsManifests(modManifest) {
  return (dispatch, getState) => {
    const {
      app: { modsManifests }
    } = getState();
    if (!modsManifests.find(v => v.projectID === modManifest.projectID)) {
      dispatch({
        type: ActionTypes.UPDATE_MODS_MANIFESTS,
        id: modManifest.projectID,
        modManifest
      });
    }
  };
}

export function removeModsManifests(id) {
  return dispatch => {
    dispatch({
      type: ActionTypes.REMOVE_MOD_MANIFEST,
      id
    });
  };
}

export function updateCurrentDownload(instanceName) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_CURRENT_DOWNLOAD,
      instanceName
    });
  };
}

export function updateSelectedInstance(name) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_SELECTED_INSTANCE,
      name
    });
  };
}

export function addStartedInstance(instance) {
  return dispatch => {
    dispatch({
      type: ActionTypes.ADD_STARTED_INSTANCE,
      instance
    });
  };
}

export function updateStartedInstance(instance) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_STARTED_INSTANCE,
      instance
    });
  };
}

export function removeStartedInstance(instanceName) {
  return dispatch => {
    dispatch({
      type: ActionTypes.REMOVE_STARTED_INSTANCE,
      instanceName
    });
  };
}

export function removeDownloadFromQueue(instanceName) {
  return async (dispatch, getState) => {
    const lockFilePath = path.join(
      _getInstancesPath(getState()),
      instanceName,
      'installing.lock'
    );
    const isLocked = await new Promise((resolve, reject) => {
      lockfile.check(lockFilePath, (err, locked) => {
        if (err) reject(err);
        resolve(locked);
      });
    });
    if (isLocked) {
      lockfile.unlock(lockFilePath, err => {
        if (err) console.log(err);
      });
    }
    dispatch({
      type: ActionTypes.UPDATE_CURRENT_DOWNLOAD,
      instanceName: null
    });
    dispatch({
      type: ActionTypes.REMOVE_DOWNLOAD_FROM_QUEUE,
      instanceName
    });
  };
}

export function updateDownloadStatus(instanceName, status) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_DOWNLOAD_STATUS,
      status,
      instanceName
    });
    dispatch(updateDownloadProgress(0));
  };
}

export function updateDownloadCurrentPhase(instanceName, status) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_DOWNLOAD_STATUS,
      status,
      instanceName
    });
  };
}

export function updateInstanceConfig(
  instanceName,
  updateFunction,
  forceWrite = false
) {
  return async (dispatch, getState) => {
    const state = getState();
    const instance = _getInstance(state)(instanceName) || {};
    const update = async () => {
      const configPath = path.join(
        _getInstancesPath(state),
        instanceName,
        'config.json'
      );
      // Remove queue and name, they are augmented in the reducer and we don't want them in the config file
      const newConfig = updateFunction(omit(instance, ['queue', 'name']));
      try {
        await fs.lstat(configPath);

        await fse.outputJson(configPath, newConfig);
      } catch {
        if (forceWrite) {
          await fse.outputJson(configPath, newConfig);
        }
      }
      dispatch({
        type: ActionTypes.UPDATE_INSTANCES,
        instances: {
          ...state.instances.list,
          [instanceName]: updateFunction(instance)
        }
      });
    };

    if (instance?.queue) {
      // Add it to the instance promise queue
      await instance.queue.add(update);
    } else {
      await update();
    }
  };
}

export function addToQueue(instanceName, modloader, manifest, background) {
  return async (dispatch, getState) => {
    const state = getState();
    const { currentDownload } = state;
    dispatch({
      type: ActionTypes.ADD_DOWNLOAD_TO_QUEUE,
      instanceName,
      modloader,
      manifest,
      background
    });
    await makeDir(path.join(_getInstancesPath(state), instanceName));
    lockfile.lock(
      path.join(_getInstancesPath(state), instanceName, 'installing.lock'),
      err => {
        if (err) console.error(err);
      }
    );

    const addMods = modloader[0] === FORGE || modloader[0] === FABRIC;

    dispatch(
      updateInstanceConfig(
        instanceName,
        prev => ({
          modloader,
          timePlayed: prev.timePlayed || 0,
          background,
          ...(addMods && { mods: [] })
        }),
        true
      )
    );
    if (!currentDownload) {
      dispatch(updateCurrentDownload(instanceName));
      dispatch(downloadInstance(instanceName));
    }
  };
}

export function addNextInstanceToCurrentDownload() {
  return (dispatch, getState) => {
    const { downloadQueue } = getState();
    const queueArr = Object.keys(downloadQueue);
    if (queueArr.length > 0) {
      dispatch(updateCurrentDownload(queueArr[0]));
      dispatch(downloadInstance(queueArr[0]));
    }
  };
}

export function downloadFabric(instanceName) {
  return async (dispatch, getState) => {
    const state = getState();
    const { modloader } = _getCurrentDownloadItem(state);

    dispatch(updateDownloadStatus(instanceName, 'Downloading fabric files...'));

    let fabricJson;
    const fabricJsonPath = path.join(
      _getLibrariesPath(state),
      'net',
      'fabricmc',
      modloader[1],
      modloader[2],
      'fabric.json'
    );
    try {
      fabricJson = await fse.readJson(fabricJsonPath);
    } catch (err) {
      fabricJson = (await getFabricJson(modloader)).data;
      await fse.outputJson(fabricJsonPath, fabricJson);
    }

    const libraries = librariesMapper(
      fabricJson.libraries,
      _getLibrariesPath(state)
    );

    const updatePercentage = downloaded => {
      dispatch(updateDownloadProgress((downloaded * 100) / libraries.length));
    };

    await downloadInstanceFiles(
      libraries,
      updatePercentage,
      state.settings.concurrentDownloads
    );
  };
}

export function downloadForge(instanceName) {
  return async (dispatch, getState) => {
    const state = getState();
    const { modloader } = _getCurrentDownloadItem(state);

    dispatch(updateDownloadStatus(instanceName, 'Downloading forge files...'));

    let forgeJson;
    const forgeJsonPath = path.join(
      _getLibrariesPath(state),
      'net',
      'minecraftforge',
      modloader[2],
      `${modloader[2]}.json`
    );
    try {
      forgeJson = await fse.readJson(forgeJsonPath);
      await fse.readFile(
        path.join(
          _getLibrariesPath(state),
          ...mavenToArray(forgeJson.mavenVersionString)
        )
      );
    } catch (err) {
      forgeJson = (await getForgeJson(modloader)).data;
      forgeJson.versionJson = JSON.parse(forgeJson.versionJson);
      if (forgeJson.installProfileJson) {
        forgeJson.installProfileJson = JSON.parse(forgeJson.installProfileJson);
      }
      await fse.outputJson(forgeJsonPath, forgeJson);
    }

    const libraries = librariesMapper(
      forgeJson.versionJson.libraries,
      _getLibrariesPath(state)
    );

    const updatePercentage = downloaded => {
      dispatch(updateDownloadProgress((downloaded * 100) / libraries.length));
    };

    await downloadInstanceFiles(
      libraries,
      updatePercentage,
      state.settings.concurrentDownloads
    );

    if (forgeJson.installProfileJson) {
      dispatch(updateDownloadStatus(instanceName, 'Patching forge...'));
      const installLibraries = librariesMapper(
        forgeJson.installProfileJson.libraries,
        _getLibrariesPath(state)
      );
      await downloadInstanceFiles(
        installLibraries,
        () => {},
        state.settings.concurrentDownloads
      );
      await patchForge113(
        forgeJson.installProfileJson,
        path.join(
          _getMinecraftVersionsPath(state),
          `${forgeJson.versionJson.inheritsFrom}.jar`
        ),
        _getLibrariesPath(state),
        _getJavaPath(state),
        (d, t) => dispatch(updateDownloadProgress((d * 100) / t))
      );
    }
  };
}

export function processManifest(instanceName) {
  return async (dispatch, getState) => {
    const state = getState();
    const { manifest } = _getCurrentDownloadItem(state);
    const concurrency = state.settings.concurrentDownloads;

    dispatch(updateDownloadStatus(instanceName, 'Downloading mods...'));

    let modManifests = [];
    await pMap(
      manifest.files,
      async item => {
        let ok = false;
        let tries = 0;
        /* eslint-disable no-await-in-loop */
        do {
          tries += 1;
          if (tries !== 1) {
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
          try {
            const { data: addon } = await getAddon(item.projectID);
            const modManifest = (
              await getAddonFile(item.projectID, item.fileID)
            ).data;
            const destFile = path.join(
              _getInstancesPath(state),
              instanceName,
              'mods',
              modManifest.fileName
            );
            const fileExists = await fse.pathExists(destFile);
            if (!fileExists) {
              await downloadFile(destFile, modManifest.downloadUrl);
            }

            modManifests = modManifests.concat(
              normalizeModData(modManifest, item.projectID, addon.name)
            );
          } catch (err) {
            console.error(err);
          }

          const percentage =
            (modManifests.length * 100) / manifest.files.length - 1;
          dispatch(updateDownloadProgress(percentage > 0 ? percentage : 0));
          ok = true;
        } while (!ok && tries <= 3);
        /* eslint-enable no-await-in-loop */
      },
      { concurrency }
    );

    await dispatch(
      updateInstanceConfig(instanceName, config => {
        return {
          ...config,
          mods: [...(config.mods || []), ...modManifests]
        };
      })
    );

    dispatch(updateDownloadStatus(instanceName, 'Copying overrides...'));
    const addonPathZip = path.join(
      _getTempPath(state),
      instanceName,
      'addon.zip'
    );
    const sevenZipPath = await get7zPath();
    const extraction = extractFull(
      addonPathZip,
      path.join(_getTempPath(state), instanceName),
      {
        recursive: true,
        $bin: sevenZipPath,
        yes: true,
        $cherryPick: 'overrides',
        $progress: true
      }
    );
    await new Promise((resolve, reject) => {
      let progress = 0;
      extraction.on('progress', ({ percent }) => {
        if (percent !== progress) {
          progress = percent;
          dispatch(updateDownloadProgress(percent));
        }
      });
      extraction.on('end', () => {
        resolve();
      });
      extraction.on('error', err => {
        reject(err.stderr);
      });
    });

    dispatch(updateDownloadStatus(instanceName, 'Finalizing overrides...'));

    // Force premature unlock to let our listener catch mods from override
    lockfile.unlock(
      path.join(_getInstancesPath(getState()), instanceName, 'installing.lock'),
      err => {
        if (err) console.log(err);
      }
    );

    await fse.copy(
      path.join(_getTempPath(state), instanceName, 'overrides'),
      path.join(_getInstancesPath(state), instanceName),
      { overwrite: true }
    );
    await fse.remove(addonPathZip);
    await fse.remove(path.join(_getTempPath(state), instanceName));
  };
}

export function downloadInstance(instanceName) {
  return async (dispatch, getState) => {
    const state = getState();
    const {
      app: {
        vanillaManifest: { versions: mcVersions }
      }
    } = state;

    dispatch(updateDownloadStatus(instanceName, 'Downloading game files...'));

    const { modloader, manifest } = _getCurrentDownloadItem(state);
    const mcVersion = modloader[1];

    let mcJson;

    // DOWNLOAD MINECRAFT JSON
    const mcJsonPath = path.join(
      _getMinecraftVersionsPath(state),
      `${mcVersion}.json`
    );
    try {
      mcJson = await fse.readJson(mcJsonPath);
    } catch (err) {
      const versionURL = mcVersions.find(v => v.id === mcVersion).url;
      mcJson = (await axios.get(versionURL)).data;
      await fse.outputJson(mcJsonPath, mcJson);
    }

    // COMPUTING MC ASSETS
    let assetsJson;
    const assetsFile = path.join(
      _getAssetsPath(state),
      'indexes',
      `${mcJson.assets}.json`
    );
    try {
      assetsJson = await fse.readJson(assetsFile);
    } catch (e) {
      assetsJson = (await axios.get(mcJson.assetIndex.url)).data;
      await fse.outputJson(assetsFile, assetsJson);
    }

    const mcMainFile = {
      url: mcJson.downloads.client.url,
      sha1: mcJson.downloads.client.sha1,
      path: path.join(_getMinecraftVersionsPath(state), `${mcJson.id}.jar`)
    };

    const assets = Object.entries(assetsJson.objects).map(
      ([assetKey, { hash }]) => ({
        url: `${MC_RESOURCES_URL}/${hash.substring(0, 2)}/${hash}`,
        type: 'asset',
        sha1: hash,
        path: path.join(
          _getAssetsPath(state),
          'objects',
          hash.substring(0, 2),
          hash
        ),
        resourcesPath: path.join(
          _getInstancesPath(state),
          instanceName,
          'resources',
          assetKey
        ),
        legacyPath: path.join(
          _getAssetsPath(state),
          'virtual',
          'legacy',
          assetKey
        )
      })
    );

    const libraries = librariesMapper(
      mcJson.libraries,
      _getLibrariesPath(state)
    );

    const updatePercentage = downloaded => {
      dispatch(
        updateDownloadProgress(
          (downloaded * 100) / (assets.length + libraries.length + 1)
        )
      );
    };

    await downloadInstanceFiles(
      [...libraries, ...assets, mcMainFile],
      updatePercentage,
      state.settings.concurrentDownloads
    );

    // Wait 400ms to avoid "The process cannot access the file because it is being used by another process."
    await new Promise(resolve => setTimeout(() => resolve(), 400));

    await extractNatives(
      libraries,
      path.join(_getInstancesPath(state), instanceName)
    );

    if (assetsJson.map_to_resources) {
      await copyAssetsToResources(assets);
    }
    if (mcJson.assets === 'legacy') {
      await copyAssetsToLegacy(assets);
    }

    if (modloader && modloader[0] === FABRIC) {
      await dispatch(downloadFabric(instanceName));
    } else if (modloader && modloader[0] === FORGE) {
      await dispatch(downloadForge(instanceName));
    }

    if (manifest) {
      await dispatch(processManifest(instanceName));
    }

    // Be aware that from this line the installer lock might be unlocked!

    await dispatch(removeDownloadFromQueue(instanceName));
    dispatch(addNextInstanceToCurrentDownload());
  };
}

export const startListener = () => {
  return async (dispatch, getState) => {
    // Real Time Scanner
    const state = getState();
    const instancesPath = _getInstancesPath(state);
    const Queue = new PromiseQueue();

    const notificationObj = {
      key: 'RTSAction',
      duration: 0
    };

    let closeMessage;

    Queue.on('start', queueLength => {
      if (queueLength > 1) {
        closeMessage = message.loading({
          ...notificationObj,
          content: `Syncronizing files. ${queueLength} left.`
        });
      }
    });

    Queue.on('executed', queueLength => {
      if (queueLength > 1) {
        closeMessage = message.loading({
          ...notificationObj,
          content: `Syncronizing files. ${queueLength} left.`
        });
      }
    });

    Queue.on('end', () => {
      setTimeout(() => {
        if (closeMessage) closeMessage();
      }, 500);
    });

    const changesTracker = {};

    const processAddedFile = async (fileName, instanceName) => {
      const processChange = async () => {
        const newState = getState();
        const instance = _getInstance(newState)(instanceName);
        const isInConfig = (instance?.mods || []).find(
          mod => mod.fileName === path.basename(fileName)
        );
        try {
          const stat = await fs.lstat(fileName);

          if (instance?.mods && !isInConfig && stat.isFile() && instance) {
            // get murmur hash
            const murmurHash = await getFileMurmurHash2(fileName);
            const { data } = await getAddonsByFingerprint([murmurHash]);
            const exactMatch = (data.exactMatches || [])[0];
            const notMatch = (data.unmatchedFingerprints || [])[0];
            let mod = {};
            if (exactMatch) {
              const { data: addon } = await getAddon(exactMatch.file.projectId);

              mod = normalizeModData(
                exactMatch.file,
                exactMatch.file.projectId,
                addon.name
              );
              mod.fileName = path.basename(fileName);
            } else if (notMatch) {
              mod = {
                fileName: path.basename(fileName),
                displayName: path.basename(fileName),
                packageFingerprint: murmurHash
              };
            }
            const updatedInstance = _getInstance(getState())(instanceName);
            const isStillNotInConfig = !(updatedInstance?.mods || []).find(
              m => m.fileName === path.basename(fileName)
            );
            if (isStillNotInConfig && updatedInstance) {
              console.log('[RTS] ADDING MOD', fileName, instanceName);
              await dispatch(
                updateInstanceConfig(instanceName, prev => ({
                  ...prev,
                  mods: [...(prev.mods || []), mod]
                }))
              );
            }
          }
        } catch (err) {
          console.error(err);
        }
      };
      Queue.add(processChange);
    };

    const processRemovedFile = async (fileName, instanceName) => {
      const processChange = async () => {
        const instance = getState().instances.list[instanceName];
        const isInConfig = (instance?.mods || []).find(
          mod => mod.fileName === path.basename(fileName)
        );
        if (isInConfig) {
          try {
            console.log('[RTS] REMOVING MOD', fileName, instanceName);
            await dispatch(
              updateInstanceConfig(instanceName, prev => ({
                ...prev,
                mods: (prev.mods || []).filter(
                  m => m.fileName !== path.basename(fileName)
                )
              }))
            );
          } catch (err) {
            console.error(err);
          }
        }
      };
      Queue.add(processChange);
    };

    const processRenamedFile = async (
      fileName,
      oldInstanceName,
      newFilePath
    ) => {
      const newState = getState();
      const instances = newState.instances.list;
      const modData = instances[oldInstanceName].mods.find(
        m => m.fileName === path.basename(fileName)
      );
      if (modData) {
        try {
          console.log('[RTS] RENAMING MOD', fileName, newFilePath, modData);
          await dispatch(
            updateInstanceConfig(oldInstanceName, prev => ({
              ...prev,
              mods: [
                ...(prev.mods || []).filter(
                  m => m.fileName !== path.basename(fileName)
                ),
                { ...modData, fileName: path.basename(newFilePath) }
              ]
            }))
          );
        } catch (err) {
          console.error(err);
        }
      }
    };

    const processAddedInstance = async instanceName => {
      const newState = getState();
      const instance = _getInstance(newState)(instanceName);
      if (!instance) {
        const configPath = path.join(
          instancesPath,
          instanceName,
          'config.json'
        );
        try {
          const config = await fse.readJSON(configPath);
          console.log('[RTS] ADDING INSTANCE', instanceName);
          dispatch({
            type: ActionTypes.UPDATE_INSTANCES,
            instances: {
              ...newState.instances.list,
              [instanceName]: { ...config, name: instanceName }
            }
          });
        } catch (err) {
          console.warn(err);
        }
      }
    };

    const processRemovedInstance = instanceName => {
      const newState = getState();
      if (_getInstance(newState)(instanceName)) {
        console.log('[RTS] REMOVING INSTANCE', instanceName);
        dispatch({
          type: ActionTypes.UPDATE_INSTANCES,
          instances: omit(newState.instances.list, [instanceName])
        });
      }
    };

    const processRenamedInstance = async (oldInstanceName, newInstanceName) => {
      const newState = getState();
      const instance = _getInstance(newState)(newInstanceName);

      if (!instance) {
        try {
          const configPath = path.join(
            instancesPath,
            newInstanceName,
            'config.json'
          );
          const config = await fse.readJSON(configPath);
          console.log(
            `[RTS] RENAMING INSTANCE ${oldInstanceName} -> ${newInstanceName}`
          );
          dispatch({
            type: ActionTypes.UPDATE_INSTANCES,
            instances: {
              ...omit(newState.instances.list, [oldInstanceName]),
              [newInstanceName]: { ...config, name: newInstanceName }
            }
          });

          const instanceManagerModalIndex = newState.modals.findIndex(
            x =>
              x.modalType === 'InstanceManager' &&
              x.modalProps.instanceName === oldInstanceName
          );

          const firstPartSplittedArr = newState.modals.slice(
            instanceManagerModalIndex
          );

          const lastPartSplittedArr2 = newState.modals.slice(
            instanceManagerModalIndex + 1,
            newState.modals.length
          );

          if (instanceManagerModalIndex >= 0) {
            if (newState.modals.length === 1) {
              dispatch({
                type: UPDATE_MODAL,
                modals: [
                  {
                    modalType: 'InstanceManager',
                    modalProps: { instanceName: newInstanceName }
                  }
                ]
              });
            } else if (newState.modals.length === 2) {
              if (instanceManagerModalIndex === newState.modals.length) {
                dispatch({
                  type: UPDATE_MODAL,
                  modals: [
                    ...newState.modals,
                    {
                      modalType: 'InstanceManager',
                      modalProps: { instanceName: newInstanceName }
                    }
                  ]
                });
              } else {
                dispatch({
                  type: UPDATE_MODAL,
                  modals: [
                    {
                      modalType: 'InstanceManager',
                      modalProps: { instanceName: newInstanceName }
                    },
                    newState.modals[1]
                  ]
                });
              }
            } else if (instanceManagerModalIndex !== newState.modals.length) {
              dispatch({
                type: UPDATE_MODAL,
                modals: [
                  ...firstPartSplittedArr,
                  newState.modals[instanceManagerModalIndex],
                  ...lastPartSplittedArr2
                ]
              });
            } else {
              dispatch({
                type: UPDATE_MODAL,
                modals: [
                  ...firstPartSplittedArr,
                  newState.modals[instanceManagerModalIndex]
                ]
              });
            }
          }
        } catch (err) {
          console.error(err);
        }
      }
    };

    ipcRenderer.on('listener-events', async (e, events) => {
      await Promise.all(
        events.map(async event => {
          // Using oldFile instead of newFile is intentional.
          // This is used to discard the ADD action dispatched alongside
          // the rename action.
          const completePath = path.join(
            event.directory,
            event.file || event.oldFile
          );

          const isRename = event.newFile && event.oldFile;

          if (
            (!isMod(completePath, instancesPath) &&
              !isInstanceFolderPath(completePath, instancesPath) &&
              !isRename) ||
            // When renaming, an ADD action is dispatched too. Try to discard that
            (event.action !== 2 && changesTracker[completePath]) ||
            // Ignore java legacy fixer
            path.basename(completePath) === '__JLF__.jar'
          ) {
            return;
          }
          if (event.action !== 2 && !changesTracker[completePath]) {
            // If we cannot find it in the hash table, it's a new event
            changesTracker[completePath] = {
              action: event.action,
              completed:
                event.action !== 0 ||
                (event.action === 0 &&
                  isInstanceFolderPath(completePath, instancesPath)),
              ...(event.action === 3 && {
                newFilePath: path.join(event.newDirectory, event.newFile)
              })
            };
          }

          if (
            changesTracker[completePath] &&
            !changesTracker[completePath].completed &&
            (event.action === 2 || event.action === 0 || event.action === 1)
          ) {
            try {
              await new Promise(resolve => setTimeout(resolve, 300));
              await fs.open(completePath, 'r+');
              changesTracker[completePath].completed = true;
            } catch {
              // Do nothing, simply not completed..
            }
          }
        })
      );

      // Handle edge case where MOD-REMOVE is called before INSTANCE-REMOVE
      Object.entries(changesTracker).forEach(
        async ([fileName, { action, completed }]) => {
          if (
            isInstanceFolderPath(fileName, instancesPath) &&
            action === 1 &&
            completed
          ) {
            const instanceName = fileName
              .replace(instancesPath, '')
              .substr(1)
              .split(path.sep)[0];
            // Check if we can find any other action with this instance name
            Object.entries(changesTracker).forEach(
              ([file, { action: act }]) => {
                if (isMod(file, instancesPath) && act === 1) {
                  const instName = file
                    .replace(instancesPath, '')
                    .substr(1)
                    .split(path.sep)[0];
                  if (instanceName === instName) {
                    delete changesTracker[file];
                  }
                }
              }
            );
          }
        }
      );

      Object.entries(changesTracker).map(
        async ([fileName, { action, completed, newFilePath }]) => {
          const filePath = newFilePath || fileName;
          // Events are dispatched 3 times. Wait for 3 dispatches to be sure
          // that the action was completely executed
          if (completed) {
            // Remove the current file from the tracker.
            // Using fileName instead of filePath is intentional for the RENAME/ADD issue
            delete changesTracker[fileName];

            // Infer the instance name from the full path
            const instanceName = filePath
              .replace(instancesPath, '')
              .substr(1)
              .split(path.sep)[0];

            // If we're installing a modpack we don't want to process anything
            const isLocked = await new Promise((resolve, reject) => {
              lockfile.check(
                path.join(instancesPath, instanceName, 'installing.lock'),
                (err, locked) => {
                  if (err) reject(err);
                  resolve(locked);
                }
              );
            });
            if (isLocked) return;

            if (
              isMod(fileName, instancesPath) &&
              _getInstance(getState())(instanceName) &&
              action !== 3
            ) {
              if (action === 0) {
                processAddedFile(filePath, instanceName);
              } else if (action === 1) {
                processRemovedFile(filePath, instanceName);
              }
            } else if (
              action === 3 &&
              !isInstanceFolderPath(fileName, instancesPath) &&
              !isInstanceFolderPath(newFilePath, instancesPath)
            ) {
              // Infer the instance name from the full path
              const oldInstanceName = fileName
                .replace(instancesPath, '')
                .substr(1)
                .split(path.sep)[0];
              if (
                oldInstanceName === instanceName &&
                isMod(newFilePath, instancesPath) &&
                isMod(fileName, instancesPath)
              ) {
                processRenamedFile(fileName, instanceName, newFilePath);
              } else if (
                oldInstanceName !== instanceName &&
                isMod(newFilePath, instancesPath) &&
                isMod(fileName, instancesPath)
              ) {
                processRemovedFile(fileName, oldInstanceName);
                processAddedFile(newFilePath, instanceName);
              } else if (
                !isMod(newFilePath, instancesPath) &&
                isMod(fileName, instancesPath)
              ) {
                processRemovedFile(fileName, oldInstanceName);
              } else if (
                isMod(newFilePath, instancesPath) &&
                !isMod(fileName, instancesPath)
              ) {
                processAddedFile(newFilePath, instanceName);
              }
            } else if (isInstanceFolderPath(filePath, instancesPath)) {
              if (action === 0) {
                processAddedInstance(instanceName);
              } else if (action === 1) {
                processRemovedInstance(instanceName);
              } else if (action === 3) {
                const oldInstanceName = fileName
                  .replace(instancesPath, '')
                  .substr(1)
                  .split(path.sep)[0];
                processRenamedInstance(oldInstanceName, instanceName);
              }
            }
          }
        }
      );
    });
    await ipcRenderer.invoke('start-listener', instancesPath);
  };
};

export function launchInstance(instanceName) {
  return async (dispatch, getState) => {
    const state = getState();
    const javaPath = _getJavaPath(state);
    const { dataPath } = state.settings;
    const account = _getCurrentAccount(state);
    const librariesPath = _getLibrariesPath(state);
    const assetsPath = _getAssetsPath(state);
    const { memory } = state.settings.java;
    const { modloader } = _getInstance(state)(instanceName);
    const instancePath = path.join(_getInstancesPath(state), instanceName);

    const instanceJLFPath = path.join(
      _getInstancesPath(state),
      instanceName,
      'mods',
      '__JLF__.jar'
    );

    const mcJson = await fse.readJson(
      path.join(_getMinecraftVersionsPath(state), `${modloader[1]}.json`)
    );
    let libraries = [];
    const mcMainFile = {
      url: mcJson.downloads.client.url,
      sha1: mcJson.downloads.client.sha1,
      path: path.join(_getMinecraftVersionsPath(state), `${mcJson.id}.jar`)
    };

    if (modloader && modloader[0] === 'fabric') {
      const fabricJsonPath = path.join(
        _getLibrariesPath(state),
        'net',
        'fabricmc',
        modloader[1],
        modloader[2],
        'fabric.json'
      );
      const fabricJson = await fse.readJson(fabricJsonPath);
      const fabricLibraries = librariesMapper(
        fabricJson.libraries,
        librariesPath
      );
      libraries = libraries.concat(fabricLibraries);
      // Replace classname
      mcJson.mainClass = fabricJson.mainClass;
    } else if (modloader && modloader[0] === 'forge') {
      const getForceLastVer = ver =>
        Number.parseInt(ver.split('.')[ver.split('.').length - 1], 10);

      if (
        lt(coerce(modloader[2]), coerce('10.13.1')) &&
        gte(coerce(modloader[2]), coerce('9.11.1')) &&
        getForceLastVer(modloader[2]) < 1217 &&
        getForceLastVer(modloader[2]) > 935
      ) {
        const moveJavaLegacyFixerToInstance = async () => {
          await fs.lstat(path.join(_getDataStorePath(state), '__JLF__.jar'));
          await fse.move(
            path.join(_getDataStorePath(state), '__JLF__.jar'),
            instanceJLFPath
          );
        };
        try {
          await moveJavaLegacyFixerToInstance();
        } catch {
          await dispatch(downloadJavaLegacyFixer(modloader));
          await moveJavaLegacyFixerToInstance();
        }
      }

      const forgeJsonPath = path.join(
        _getLibrariesPath(state),
        'net',
        'minecraftforge',
        modloader[2],
        `${modloader[2]}.json`
      );
      const forgeJson = await fse.readJson(forgeJsonPath);
      const forgeLibraries = librariesMapper(
        forgeJson.versionJson.libraries,
        librariesPath
      );
      libraries = libraries.concat(forgeLibraries);
      // Replace classname
      mcJson.mainClass = forgeJson.versionJson.mainClass;
      if (forgeJson.versionJson.minecraftArguments) {
        mcJson.minecraftArguments = forgeJson.versionJson.minecraftArguments;
      } else if (forgeJson.versionJson.arguments.game) {
        mcJson.arguments.game = mcJson.arguments.game.concat(
          forgeJson.versionJson.arguments.game
        );
      }
    }
    libraries = removeDuplicates(
      libraries.concat(librariesMapper(mcJson.libraries, librariesPath)),
      'url'
    );

    const getJvmArguments =
      mcJson.assets !== 'legacy' && gte(coerce(mcJson.assets), coerce('1.13'))
        ? getJVMArguments113
        : getJVMArguments112;

    const jvmArguments = getJvmArguments(
      libraries,
      mcMainFile,
      instancePath,
      assetsPath,
      mcJson,
      account,
      memory
    );

    const symLinkDirPath = path.join(dataPath.split('\\')[0], '_gdl');

    const replaceRegex = [
      process.platform === 'win32'
        ? new RegExp(dataPath.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'g')
        : null,
      symLinkDirPath
    ];

    if (process.platform === 'win32') await symlink(dataPath, symLinkDirPath);

    console.log(
      `"${javaPath}" ${getJvmArguments(
        libraries,
        mcMainFile,
        instancePath,
        assetsPath,
        mcJson,
        account,
        memory,
        true
      ).join(' ')}`.replace(...replaceRegex)
    );

    if (state.settings.hideWindowOnGameLaunch) {
      await ipcRenderer.invoke('hide-window');
    }

    const ps = spawn(
      `"${javaPath.replace(...replaceRegex)}"`,
      jvmArguments.map(v => v.replace(...replaceRegex)),
      {
        cwd: instancePath,
        shell: true
      }
    );

    const playTimer = setInterval(() => {
      dispatch(
        updateInstanceConfig(instanceName, prev => ({
          ...prev,
          timePlayed: (Number(prev.timePlayed) || 0) + 1
        }))
      );
    }, 60 * 1000);
    dispatch(addStartedInstance({ instanceName, pid: ps.pid }));

    ps.stdout.on('data', data => {
      console.log(data.toString());
      if (data.toString().includes('Setting user:')) {
        dispatch(updateStartedInstance({ instanceName, initialized: true }));
      }
    });

    ps.stderr.on('data', data => {
      console.error(`ps stderr: ${data}`);
    });

    ps.on('close', code => {
      ipcRenderer.invoke('show-window');
      fse.remove(instanceJLFPath);
      if (process.platform === 'win32') fse.remove(symLinkDirPath);
      dispatch(removeStartedInstance(instanceName));
      clearInterval(playTimer);
      if (code !== 0) {
        console.warn(`Process exited with code ${code}. Not too good..`);
      }
    });
  };
}

export function installMod(
  projectID,
  fileID,
  instanceName,
  gameVersion,
  installDeps = true
) {
  return async (dispatch, getState) => {
    const state = getState();
    const instancesPath = _getInstancesPath(state);
    const instancePath = path.join(instancesPath, instanceName);
    const mainModData = await getAddonFile(projectID, fileID);
    const { data: addon } = await getAddon(projectID);
    mainModData.data.projectID = projectID;

    const destFile = path.join(instancePath, 'mods', mainModData.data.fileName);
    let needToAddMod = true;
    await dispatch(
      updateInstanceConfig(instanceName, prev => {
        needToAddMod = !prev.mods.find(
          v => v.fileID === fileID && v.projectID === projectID
        );
        return {
          ...prev,
          mods: [
            ...prev.mods,
            ...(needToAddMod
              ? [normalizeModData(mainModData.data, projectID, addon.name)]
              : [])
          ]
        };
      })
    );

    if (!needToAddMod) {
      return;
    }

    try {
      await fse.open(destFile);
      const murmur2 = await getFileMurmurHash2(destFile);
      if (murmur2 !== mainModData.data.packageFingerprint) {
        await downloadFile(destFile, mainModData.data.downloadUrl);
      }
    } catch {
      await downloadFile(destFile, mainModData.data.downloadUrl);
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
            const depList = await getAddonFiles(dep.addonId);
            const depData = depList.data.find(v =>
              v.gameVersion.includes(gameVersion)
            );
            await dispatch(
              installMod(
                dep.addonId,
                depData.id,
                instanceName,
                gameVersion,
                installDeps
              )
            );
          }
        },
        { concurrency: 2 }
      );
    }
  };
}
