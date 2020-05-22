import axios from 'axios';
import path from 'path';
import { ipcRenderer } from 'electron';
import { v5 as uuid } from 'uuid';
import { machineId } from 'node-machine-id';
import fse from 'fs-extra';
import coerce from 'semver/functions/coerce';
import gte from 'semver/functions/gte';
import lt from 'semver/functions/lt';
import lte from 'semver/functions/lte';
import gt from 'semver/functions/gt';
import omitBy from 'lodash/omitBy';
import { pipeline } from 'stream';
import zlib from 'zlib';
import lockfile from 'lockfile';
import omit from 'lodash/omit';
import Seven, { extractFull } from 'node-7z';
import { push } from 'connected-react-router';
import { spawn } from 'child_process';
import symlink from 'symlink-dir';
import { promises as fs } from 'fs';
import originalFs from 'original-fs';
import pMap from 'p-map';
import makeDir from 'make-dir';
import { parse } from 'semver';
import * as ActionTypes from './actionTypes';
import {
  NEWS_URL,
  MC_RESOURCES_URL,
  GDL_LEGACYJAVAFIXER_MOD_URL,
  FORGE,
  FABRIC,
  FMLLIBS_OUR_BASE_URL,
  FMLLIBS_FORGE_BASE_URL
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
  getAddonFile,
  getJavaManifest,
  getAddonsByFingerprint,
  getAddonFiles,
  getAddon,
  getAddonCategories
} from '../api';
import {
  _getNativeLibs,
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
  _getInstances,
  _getDataStorePath
} from '../utils/selectors';
import {
  librariesMapper,
  get7zPath,
  extractNatives,
  getJVMArguments112,
  copyAssetsToResources,
  getJVMArguments113,
  patchForge113,
  mavenToArray,
  copyAssetsToLegacy,
  getPlayerSkin,
  normalizeModData,
  reflect,
  isMod,
  isInstanceFolderPath,
  getFileHash,
  getFilesRecursive,
  filterForgeFilesByVersion,
  filterFabricFilesByVersion,
  getPatchedInstanceType,
  convertCompletePathToInstance,
  downloadAddonZip,
  convertcurseForgeToCanonical
} from '../../app/desktop/utils';
import {
  downloadFile,
  downloadInstanceFiles
} from '../../app/desktop/utils/downloader';
import { removeDuplicates, getFileMurmurHash2 } from '../utils';
import { UPDATE_CONCURRENT_DOWNLOADS } from './settings/actionTypes';
import { UPDATE_MODAL } from './modals/actionTypes';
import PromiseQueue from '../../app/desktop/utils/PromiseQueue';
import fmlLibsMapping from '../../app/desktop/utils/fmllibs';
import { openModal } from './modals/actions';

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
      const forge = (await getForgeManifest()).data;
      const forgeVersions = {};
      // Looping over vanilla versions, create a new entry in forge object
      // and add to it all correct versions
      mc.versions.forEach(v => {
        if (forge[v.id]) {
          forgeVersions[v.id] = forge[v.id];
        }
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

    if (fabric.e || java.e || categories.e || forge.e) {
      console.error(fabric, java, categories, forge);
    }

    return {
      mc: mc || app.vanillaManifest,
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
      percentage: Number(percentage).toFixed(0)
    });
  };
}

export function updateUserData(userData) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_USERDATA,
      path: userData
    });
    return userData;
  };
}

export function updateMessage(message) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_MESSAGE,
      message
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
      try {
        const skinUrl = await getPlayerSkin(selectedProfile.id);
        if (skinUrl) {
          dispatch(
            updateAccount(selectedProfile.id, {
              ...currentAccount,
              skin: skinUrl
            })
          );
        }
      } catch (err) {
        console.warn('Could not fetch skin');
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
    const vanillaMCPath =
      process.platform === 'linux'
        ? path.resolve(homedir, '../', mcFolder)
        : path.join(homedir, mcFolder);
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
      await fse.outputJson(
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
  return async (dispatch, getState) => {
    const {
      app: { clientToken }
    } = getState();
    if (clientToken) return clientToken;
    const MY_NAMESPACE = '1dfd2800-790c-11ea-a17c-e930c253ce6b';
    const machineUuid = await machineId();
    const newToken = uuid(machineUuid, MY_NAMESPACE);
    dispatch({
      type: ActionTypes.UPDATE_CLIENT_TOKEN,
      clientToken: newToken
    });
    return newToken;
  };
}

export function updateLatestModManifests(manifests) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_MOD_MANIFESTS,
      manifests
    });
  };
}

export function clearLatestModManifests() {
  return dispatch => {
    dispatch({
      type: ActionTypes.CLEAR_MOD_MANIFESTS
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

export function updateLastUpdateVersion(version) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_LAST_UPDATE_VERSION,
      version
    });
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

export function addToQueue(
  instanceName,
  modloader,
  manifest,
  background,
  timePlayed
) {
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
          timePlayed: prev.timePlayed || timePlayed || 0,
          background,
          ...(addMods && { mods: prev.mods || [] })
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

    const forgeJsonPath = path.join(
      _getLibrariesPath(state),
      'net',
      'minecraftforge',
      modloader[2],
      `${modloader[2]}.json`
    );

    const checkForgeSkip = await fse.pathExists(forgeJsonPath);
    if (!checkForgeSkip) {
      const forgeJson = {};

      const sevenZipPath = await get7zPath();
      const pre152 = lte(coerce(modloader[1]), coerce('1.5.2'));
      const pre132 = lte(coerce(modloader[1]), coerce('1.3.2'));
      const baseUrl =
        'https://files.minecraftforge.net/maven/net/minecraftforge/forge';
      const tempInstaller = path.join(
        _getTempPath(state),
        `${modloader[2]}.jar`
      );
      const expectedInstaller = path.join(
        _getDataStorePath(state),
        'forgeInstallers',
        `${modloader[2]}.jar`
      );

      const extractSpecificFile = async from => {
        const extraction = extractFull(tempInstaller, _getTempPath(state), {
          $bin: sevenZipPath,
          yes: true,
          $cherryPick: from
        });
        await new Promise((resolve, reject) => {
          extraction.on('end', () => {
            resolve();
          });
          extraction.on('error', error => {
            reject(error.stderr);
          });
        });
      };

      try {
        await fs.access(expectedInstaller);
        if (!pre152) {
          await fs.access(forgeJsonPath);
        }
        const { data: hashes } = await axios.get(
          `https://files.minecraftforge.net/maven/net/minecraftforge/forge/${modloader[2]}/meta.json`
        );
        console.log(hashes);
        const fileMd5 = await getFileHash(expectedInstaller, 'md5');
        let expectedMd5 = hashes?.classifiers?.installer?.jar;
        if (pre132) {
          expectedMd5 = hashes?.classifiers?.client?.zip;
        } else if (pre152) {
          expectedMd5 = hashes?.classifiers?.universal?.zip;
        }

        if (fileMd5.toString() !== expectedMd5) {
          throw new Error('Installer hash mismatch');
        }
        await fse.copy(expectedInstaller, tempInstaller, { overwrite: true });
      } catch (err) {
        console.warn(
          'No installer found in temp or hash mismatch. Need to download it.'
        );
        dispatch(
          updateDownloadStatus(instanceName, 'Downloading forge installer...')
        );

        let urlTerminal = 'installer.jar';
        if (pre132) {
          urlTerminal = 'client.zip';
        } else if (pre152) {
          urlTerminal = 'universal.zip';
        }

        // Download installer jar and extract stuff
        await downloadFile(
          tempInstaller,
          `${baseUrl}/${modloader[2]}/forge-${modloader[2]}-${urlTerminal}`,
          p => dispatch(updateDownloadProgress(p))
        );

        await new Promise(resolve => setTimeout(resolve, 200));
        await fse.copy(tempInstaller, expectedInstaller);
      }

      const installForgePost152 = async () => {
        // Extract version / install json, main jar, universal and client lzma
        await extractSpecificFile('install_profile.json');
        const installerJson = await fse.readJson(
          path.join(_getTempPath(state), 'install_profile.json')
        );

        if (installerJson.install) {
          forgeJson.install = installerJson.install;
          forgeJson.version = installerJson.versionInfo;
        } else {
          forgeJson.install = installerJson;
          await extractSpecificFile(path.basename(installerJson.json));
          forgeJson.version = await fse.readJson(
            path.join(_getTempPath(state), installerJson.json)
          );
          await fse.remove(path.join(_getTempPath(state), installerJson.json));
        }

        await fse.remove(
          path.join(_getTempPath(state), 'install_profile.json')
        );

        // Extract forge bin
        if (forgeJson.install.filePath) {
          await extractSpecificFile(forgeJson.install.filePath);

          await fse.move(
            path.join(_getTempPath(state), forgeJson.install.filePath),
            path.join(
              _getLibrariesPath(state),
              ...mavenToArray(forgeJson.install.path)
            ),
            { overwrite: true }
          );
        } else {
          // Move all files in maven
          const forgeBinPathInsideZip = path.join(
            'maven',
            path.dirname(path.join(...mavenToArray(forgeJson.install.path)))
          );
          await extractSpecificFile(forgeBinPathInsideZip);

          const filesToMove = await fs.readdir(
            path.join(_getTempPath(state), forgeBinPathInsideZip)
          );
          await Promise.all(
            filesToMove.map(async f => {
              await fse.move(
                path.join(_getTempPath(state), forgeBinPathInsideZip, f),
                path.join(
                  _getLibrariesPath(state),
                  path.dirname(
                    path.join(...mavenToArray(forgeJson.install.path))
                  ),
                  path.basename(f)
                ),
                { overwrite: true }
              );
            })
          );

          await fse.remove(path.join(_getTempPath(state), 'maven'));
        }

        dispatch(
          updateDownloadStatus(instanceName, 'Downloading forge libraries...')
        );

        let { libraries } = forgeJson.version;

        if (forgeJson.install.libraries) {
          libraries = libraries.concat(forgeJson.install.libraries);
        }

        libraries = librariesMapper(
          libraries.filter(
            v =>
              !v.name.includes('net.minecraftforge:forge:') &&
              !v.name.includes('net.minecraftforge:minecraftforge:')
          ),
          _getLibrariesPath(state)
        );

        const updatePercentage = downloaded => {
          dispatch(
            updateDownloadProgress((downloaded * 100) / libraries.length)
          );
        };

        await downloadInstanceFiles(
          libraries,
          updatePercentage,
          state.settings.concurrentDownloads
        );

        // Patching
        if (forgeJson.install?.processors?.length) {
          dispatch(updateDownloadStatus(instanceName, 'Patching forge...'));

          // Extract client.lzma from installer

          await extractSpecificFile(path.join('data', 'client.lzma'));

          await fse.move(
            path.join(_getTempPath(state), 'data', 'client.lzma'),
            path.join(
              _getLibrariesPath(state),
              ...mavenToArray(forgeJson.install.path, '-clientdata', '.lzma')
            ),
            { overwrite: true }
          );
          await fse.remove(path.join(_getTempPath(state), 'data'));

          await patchForge113(
            forgeJson.install,
            path.join(
              _getMinecraftVersionsPath(state),
              `${forgeJson.install.minecraft}.jar`
            ),
            _getLibrariesPath(state),
            _getJavaPath(state),
            (d, t) => dispatch(updateDownloadProgress((d * 100) / t))
          );
        }
      };

      if (gt(coerce(modloader[1]), coerce('1.5.2'))) {
        await installForgePost152();
      } else {
        // Download necessary libs
        const fmllibs = fmlLibsMapping[modloader[1]];
        await pMap(
          fmllibs || [],
          async lib => {
            let ok = false;
            let tries = 0;
            do {
              tries += 1;
              if (tries !== 1) {
                await new Promise(resolve => setTimeout(resolve, 5000));
              }
              try {
                const fileName = path.join(
                  _getInstancesPath(state),
                  instanceName,
                  'lib',
                  lib[0]
                );
                const baseFmlUrl = lib[2]
                  ? FMLLIBS_OUR_BASE_URL
                  : FMLLIBS_FORGE_BASE_URL;
                const url = `${baseFmlUrl}/${lib[0]}`;
                await downloadFile(fileName, url);
                const fileHash = await getFileHash(fileName);
                if (lib[1] !== fileHash.toString()) {
                  throw new Error(`FMLLIB hash mismatch (${lib[0]})`);
                }
                ok = true;
              } catch (err) {
                console.error(err);
              }
            } while (!ok && tries <= 3);
          },
          { concurrency: state.settings.concurrentDownloads }
        );

        dispatch(updateDownloadStatus(instanceName, 'Injecting forge...'));
        dispatch(updateDownloadProgress(0));

        // Perform forge injection
        const mcJarPath = path.join(
          _getMinecraftVersionsPath(state),
          `${modloader[1]}.jar`
        );
        const mcJarForgePath = path.join(
          _getMinecraftVersionsPath(state),
          `${modloader[2]}.jar`
        );
        await fse.copy(mcJarPath, mcJarForgePath);

        const metaInfDeletion = Seven.delete(mcJarForgePath, 'META-INF', {
          $bin: sevenZipPath,
          yes: true
        });
        await new Promise((resolve, reject) => {
          metaInfDeletion.on('end', () => {
            resolve();
          });
          metaInfDeletion.on('error', error => {
            reject(error.stderr);
          });
        });

        await fse.remove(path.join(_getTempPath(state), modloader[2]));

        // This is garbage, need to use a stream somehow to directly inject data from/to jar
        const extraction = extractFull(
          tempInstaller,
          path.join(_getTempPath(state), modloader[2]),
          {
            $bin: sevenZipPath,
            yes: true
          }
        );
        await new Promise((resolve, reject) => {
          extraction.on('end', () => {
            resolve();
          });
          extraction.on('error', error => {
            reject(error.stderr);
          });
        });

        dispatch(updateDownloadProgress(50));

        const updatedFiles = Seven.add(
          mcJarForgePath,
          `${path.join(_getTempPath(state), modloader[2])}/*`,
          {
            $bin: sevenZipPath,
            yes: true
          }
        );
        await new Promise((resolve, reject) => {
          updatedFiles.on('end', () => {
            resolve();
          });
          updatedFiles.on('error', error => {
            reject(error.stderr);
          });
        });

        await fse.remove(path.join(_getTempPath(state), modloader[2]));
      }

      await fse.remove(tempInstaller);

      // Finally write manifest and use to check if valid next time.
      await fse.outputJson(forgeJsonPath, forgeJson);
    }
  };
}

export function processManifest(instanceName) {
  return async (dispatch, getState) => {
    const state = getState();
    const { manifest } = _getCurrentDownloadItem(state);
    const concurrency = state.settings.concurrentDownloads;
    const instanceList = _getInstances(state);
    const instancesWithMods = instanceList.filter(instance => {
      if (!(instance?.mods && instance.mods.length !== 0)) return false;
      return instance.name !== instanceName;
    });

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
            // Copy from other instances if file exists.
            const firstInstanceWithModMatch = instancesWithMods.find(instance =>
              instance.mods.some(
                mod =>
                  mod.projectID === item.projectID && mod.fileID === item.fileID
              )
            );
            const modData = firstInstanceWithModMatch?.mods.find(
              mod => mod.projectID === item.projectID
            );

            if (modData) {
              const destFile = path.join(
                _getInstancesPath(state),
                instanceName,
                modData.categorySection.path,
                modData.fileName
              );
              const destFileExistsInstance = await fse.pathExists(destFile);
              if (!destFileExistsInstance) {
                console.log(
                  `[Mod Cache] Retrieved from instance: ${modData.fileName}`
                );
                const otherInstance = path.join(
                  _getInstancesPath(state),
                  firstInstanceWithModMatch.name,
                  modData.categorySection.path,
                  modData.fileName
                );

                await fse.ensureDir(path.dirname(destFile));
                try {
                  await fse.ensureLink(path.join(otherInstance), destFile);
                } catch {
                  await fse.copyFile(path.join(otherInstance), destFile);
                }
                modManifests = modManifests.concat(modData);

                const percentage =
                  (modManifests.length * 100) / manifest.files.length - 1;
                dispatch(
                  updateDownloadProgress(percentage > 0 ? percentage : 0)
                );
                ok = true;

                // eslint-disable-next-line no-continue
                continue;
              }
            }

            // Download mod from curseforge.
            const { data: addon } = await getAddon(item.projectID);
            const modManifest = (
              await getAddonFile(item.projectID, item.fileID)
            ).data;
            const destFile = path.join(
              _getInstancesPath(state),
              instanceName,
              addon.categorySection.path,
              modManifest.fileName
            );
            const fileExists = await fse.pathExists(destFile);
            if (!fileExists) {
              await downloadFile(destFile, modManifest.downloadUrl);
            }

            const newManifest = normalizeModData(
              modManifest,
              item.projectID,
              addon.name,
              addon.categorySection // name: "Mods", "Texture Packs", "Worlds", path: "mods", "resourcepacks", "saves"
            );

            modManifests = modManifests.concat(newManifest);

            const percentage =
              (modManifests.length * 100) / manifest.files.length - 1;
            dispatch(updateDownloadProgress(percentage > 0 ? percentage : 0));
            ok = true;
          } catch (err) {
            console.error(err);
          }
        } while (!ok && tries <= 3);
        /* eslint-enable no-await-in-loop */
      },
      { concurrency }
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

    const overrideFiles = await getFilesRecursive(
      path.join(_getTempPath(state), instanceName, 'overrides')
    );
    await dispatch(
      updateInstanceConfig(instanceName, config => {
        return {
          ...config,
          mods: [...(config.mods || []), ...modManifests],
          overrides: overrideFiles.map(v =>
            path.relative(
              path.join(_getTempPath(state), instanceName, 'overrides'),
              v
            )
          )
        };
      })
    );

    await new Promise(resolve => {
      // Force premature unlock to let our listener catch mods from override
      lockfile.unlock(
        path.join(
          _getInstancesPath(getState()),
          instanceName,
          'installing.lock'
        ),
        err => {
          if (err) console.error(err);
          resolve();
        }
      );
    });

    await Promise.all(
      overrideFiles.map(v => {
        const relativePath = path.relative(
          path.join(_getTempPath(state), instanceName, 'overrides'),
          v
        );
        const newPath = path.join(
          _getInstancesPath(state),
          instanceName,
          relativePath
        );
        return fse.copy(v, newPath, { overwrite: true });
      })
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

    const mcJsonPath = path.join(
      _getMinecraftVersionsPath(state),
      `${mcVersion}.json`
    );
    const skipInstallVanilla = await fse.pathExists(mcJsonPath);
    if (skipInstallVanilla) {
      // Read Manifest and extra natives.
      mcJson = await fse.readJson(mcJsonPath);

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
    } else {
      // DOWNLOAD MINECRAFT JSON
      try {
        mcJson = await fse.readJson(mcJsonPath);
      } catch (err) {
        const versionURL = mcVersions.find(v => v.id === mcVersion).url;
        mcJson = (await axios.get(versionURL)).data;
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
        path.join(_getNativeLibs(state), mcVersion)
      );

      if (assetsJson.map_to_resources) {
        await copyAssetsToResources(assets);
      }
      if (mcJson.assets === 'legacy') {
        await copyAssetsToLegacy(assets);
      }

      // Finally write manifest and use to check if valid next time.
      await fse.outputJson(mcJsonPath, mcJson);

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
    }
  };
}

export const changeModpackVersion = (instanceName, newModpackData) => {
  return async (dispatch, getState) => {
    const state = getState();
    const instance = _getInstance(state)(instanceName);
    const tempPath = _getTempPath(state);
    const instancePath = path.join(_getInstancesPath(state), instanceName);

    const { data: addon } = await getAddon(instance.modloader[3]);

    const manifest = await fse.readJson(
      path.join(instancePath, 'manifest.json')
    );

    await fse.remove(path.join(instancePath, 'manifest.json'));

    // Delete prev overrides
    await Promise.all(
      (instance?.overrides || []).map(async v => {
        try {
          await fs.stat(path.join(instancePath, v));
          await fse.remove(path.join(instancePath, v));
        } catch {
          // Swallow error
        }
      })
    );

    const modsProjectIDs = (manifest?.files || []).map(v => v?.projectID);

    dispatch(
      updateInstanceConfig(instanceName, prev =>
        omit(
          {
            ...prev,
            mods: prev.mods.filter(v => !modsProjectIDs.includes(v?.projectID))
          },
          ['overrides']
        )
      )
    );

    await Promise.all(
      modsProjectIDs.map(async projectID => {
        const modFound = instance.mods?.find(v => v?.projectID === projectID);
        if (modFound?.fileName) {
          try {
            await fs.stat(path.join(instancePath, 'mods', modFound?.fileName));
            await fse.remove(
              path.join(instancePath, 'mods', modFound?.fileName)
            );
          } catch {
            // Swallow error
          }
        }
      })
    );

    const imageURL = addon?.attachments?.find(v => v.isDefault)?.thumbnailUrl;

    const newManifest = await downloadAddonZip(
      instance.modloader[3],
      newModpackData.id,
      path.join(_getInstancesPath(state), instanceName),
      path.join(tempPath, instanceName)
    );

    await downloadFile(
      path.join(
        _getInstancesPath(state),
        instanceName,
        `background${path.extname(imageURL)}`
      ),
      imageURL
    );

    const modloader = [
      instance.modloader[0],
      newManifest.minecraft.version,
      convertcurseForgeToCanonical(
        newManifest.minecraft.modLoaders.find(v => v.primary).id,
        newManifest.minecraft.version,
        state.app.forgeManifest
      ),
      instance.modloader[3],
      newModpackData.id
    ];
    dispatch(
      addToQueue(
        instanceName,
        modloader,
        newManifest,
        `background${path.extname(imageURL)}`
      )
    );
  };
};

export const startListener = () => {
  return async (dispatch, getState) => {
    // Real Time Scanner
    const state = getState();
    const instancesPath = _getInstancesPath(state);
    const Queue = new PromiseQueue();

    Queue.on('start', queueLength => {
      if (queueLength > 1) {
        dispatch(
          updateMessage({
            content: `Syncronizing mods. ${queueLength} left.`,
            duration: 0
          })
        );
      }
    });

    Queue.on('executed', queueLength => {
      if (queueLength > 1) {
        dispatch(
          updateMessage({
            content: `Syncronizing mods. ${queueLength} left.`,
            duration: 0
          })
        );
      }
    });

    Queue.on('end', () => {
      dispatch(updateMessage(null));
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
                addon.name,
                addon.categorySection
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
      const processChange = async () => {
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
      Queue.add(processChange);
    };

    const processAddedInstance = async instanceName => {
      const processChange = async () => {
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

            if (!config.modloader) {
              throw new Error(`Config for ${instanceName} could not be parsed`);
            }
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
      Queue.add(processChange);
    };

    const processRemovedInstance = instanceName => {
      const processChange = async () => {
        const newState = getState();
        if (_getInstance(newState)(instanceName)) {
          console.log('[RTS] REMOVING INSTANCE', instanceName);
          dispatch({
            type: ActionTypes.UPDATE_INSTANCES,
            instances: omit(newState.instances.list, [instanceName])
          });
        }
      };
      Queue.add(processChange);
    };

    const processRenamedInstance = async (oldInstanceName, newInstanceName) => {
      const processChange = async () => {
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
            if (!config.modloader) {
              throw new Error(
                `Config for ${newInstanceName} could not be parsed`
              );
            }
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

            dispatch({
              type: UPDATE_MODAL,
              modals: [
                ...newState.modals.slice(0, instanceManagerModalIndex),
                {
                  modalType: 'InstanceManager',
                  modalProps: { instanceName: newInstanceName }
                },
                ...newState.modals.slice(instanceManagerModalIndex + 1)
              ]
            });
          } catch (err) {
            console.error(err);
          }
        }
      };
      Queue.add(processChange);
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
            const instanceName = convertCompletePathToInstance(
              fileName,
              instancesPath
            )
              .substr(1)
              .split(path.sep)[0];
            // Check if we can find any other action with this instance name
            Object.entries(changesTracker).forEach(
              ([file, { action: act }]) => {
                if (isMod(file, instancesPath) && act === 1) {
                  const instName = convertCompletePathToInstance(
                    file,
                    instancesPath
                  )
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
            const instanceName = convertCompletePathToInstance(
              filePath,
              instancesPath
            )
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
              const oldInstanceName = convertCompletePathToInstance(
                fileName,
                instancesPath
              )
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
                const oldInstanceName = convertCompletePathToInstance(
                  fileName,
                  instancesPath
                )
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
    const { userData } = state;
    const account = _getCurrentAccount(state);
    const librariesPath = _getLibrariesPath(state);
    const assetsPath = _getAssetsPath(state);
    const { memory, args } = state.settings.java;
    const {
      resolution: globalMinecraftResolution
    } = state.settings.minecraftSettings;
    const {
      modloader,
      javaArgs,
      javaMemory,
      resolution: instanceResolution
    } = _getInstance(state)(instanceName);

    const instancePath = path.join(_getInstancesPath(state), instanceName);

    const instanceJLFPath = path.join(
      _getInstancesPath(state),
      instanceName,
      'mods',
      '__JLF__.jar'
    );

    let errorLogs = '';

    const mcJson = await fse.readJson(
      path.join(_getMinecraftVersionsPath(state), `${modloader[1]}.json`)
    );
    let libraries = [];
    let mcMainFile = {
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
      if (gt(coerce(modloader[1]), coerce('1.5.2'))) {
        const getForgeLastVer = ver =>
          Number.parseInt(ver.split('.')[ver.split('.').length - 1], 10);

        if (
          lt(coerce(modloader[2].split('-')[1]), coerce('10.13.1')) &&
          gte(coerce(modloader[2].split('-')[1]), coerce('9.11.1')) &&
          getForgeLastVer(modloader[2]) < 1217 &&
          getForgeLastVer(modloader[2]) > 935
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
          forgeJson.version.libraries,
          librariesPath
        );
        libraries = libraries.concat(forgeLibraries);
        // Replace classname
        mcJson.mainClass = forgeJson.version.mainClass;
        if (forgeJson.version.minecraftArguments) {
          mcJson.minecraftArguments = forgeJson.version.minecraftArguments;
        } else if (forgeJson.version.arguments.game) {
          mcJson.arguments.game = mcJson.arguments.game.concat(
            forgeJson.version.arguments.game
          );
        }
      } else {
        mcMainFile = {
          path: path.join(
            _getMinecraftVersionsPath(state),
            `${modloader[2]}.jar`
          )
        };
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

    const javaArguments = (javaArgs !== undefined ? javaArgs : args).split(' ');
    const javaMem = javaMemory !== undefined ? javaMemory : memory;
    const gameResolution = instanceResolution || globalMinecraftResolution;

    const jvmArguments = getJvmArguments(
      libraries,
      path.join(_getNativeLibs(state), modloader[1]),
      mcMainFile,
      instancePath,
      assetsPath,
      mcJson,
      account,
      javaMem,
      gameResolution,
      false,
      javaArguments
    );

    const symLinkDirPath = path.join(userData.split('\\')[0], '_gdl');

    const replaceRegex = [
      process.platform === 'win32'
        ? new RegExp(userData.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'g')
        : null,
      symLinkDirPath
    ];

    if (process.platform === 'win32') await symlink(userData, symLinkDirPath);

    console.log(
      `"${javaPath}" ${jvmArguments.join(' ')}`.replace(...replaceRegex)
    );

    if (state.settings.hideWindowOnGameLaunch) {
      await ipcRenderer.invoke('hide-window');
    }

    const minecraftProcess = spawn(
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

    dispatch(
      updateInstanceConfig(instanceName, prev => ({
        ...prev,
        lastPlayed: Date.now()
      }))
    );
    dispatch(addStartedInstance({ instanceName, pid: minecraftProcess.pid }));

    minecraftProcess.stdout.on('data', data => {
      console.log(data.toString());
      if (data.toString().includes('Setting user:')) {
        dispatch(updateStartedInstance({ instanceName, initialized: true }));
      }
    });

    minecraftProcess.stderr.on('data', data => {
      console.error(`ps stderr: ${data}`);
      errorLogs += data || '';
    });

    minecraftProcess.on('close', code => {
      ipcRenderer.invoke('show-window');
      fse.remove(instanceJLFPath);
      if (process.platform === 'win32') fse.remove(symLinkDirPath);
      dispatch(removeStartedInstance(instanceName));
      clearInterval(playTimer);
      if (code !== 0 && errorLogs) {
        dispatch(
          openModal('InstanceCrashed', {
            code,
            errorLogs: errorLogs?.toString('utf8')
          })
        );
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
  installDeps = true,
  onProgress,
  useTempMiddleware
) {
  return async (dispatch, getState) => {
    const state = getState();
    const instancesPath = _getInstancesPath(state);
    const instancePath = path.join(instancesPath, instanceName);
    let needToAddMod = true;

    // Get existing instances with mods
    const instanceList = _getInstances(state);
    const instancesWithMods = instanceList.filter(instance => {
      if (!(instance?.mods && instance.mods.length !== 0)) return false;
      return instance.name !== instanceName;
    });

    // Copy from other instances if file exists.
    const firstInstanceWithModMatch = instancesWithMods.find(instance =>
      instance.mods.some(
        mod => mod.projectID === projectID && mod.fileID === fileID
      )
    );
    const modData = firstInstanceWithModMatch?.mods.find(
      mod => mod.projectID === projectID
    );

    if (modData) {
      const instanceDestFile = path.join(
        _getInstancesPath(state),
        instanceName,
        modData.categorySection ? modData.categorySection.path : 'mods',
        modData.fileName
      );
      const destFileExistsInstance = await fse.pathExists(instanceDestFile);
      if (!destFileExistsInstance) {
        const otherInstance = path.join(
          _getInstancesPath(state),
          firstInstanceWithModMatch.name,
          modData.categorySection ? modData.categorySection.path : 'mods',
          modData.fileName
        );

        await fse.ensureDir(path.dirname(instanceDestFile));
        try {
          await fse.ensureLink(path.join(otherInstance), instanceDestFile);
        } catch {
          await fse.copyFile(path.join(otherInstance), instanceDestFile);
        }
      }

      // manifest was already normalized so just append it to the array.
      await dispatch(
        updateInstanceConfig(instanceName, prev => {
          needToAddMod = !prev.mods.find(
            v => v.fileID === fileID && v.projectID === projectID
          );
          return {
            ...prev,
            mods: [...prev.mods, ...(needToAddMod ? [modData] : [])]
          };
        })
      );
      if (installDeps) {
        await pMap(
          modData.dependencies,
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
                  installDeps,
                  onProgress,
                  useTempMiddleware
                )
              );
            }
          },
          { concurrency: 2 }
        );
      }
      return;
    }

    // Fetch from curseforge
    const mainModData = await getAddonFile(projectID, fileID);
    const { data: addon } = await getAddon(projectID);
    mainModData.data.projectID = projectID;
    const destFile = path.join(
      instancePath,
      addon.categorySection.path,
      mainModData.data.fileName
    );
    const tempFile = path.join(_getTempPath(state), mainModData.data.fileName);
    const newModManifest = normalizeModData(
      mainModData.data,
      projectID,
      addon.name,
      addon.categorySection
    );

    if (useTempMiddleware) {
      await downloadFile(tempFile, mainModData.data.downloadUrl, onProgress);
    }

    await dispatch(
      updateInstanceConfig(instanceName, prev => {
        needToAddMod = !prev.mods.find(
          v => v.fileID === fileID && v.projectID === projectID
        );
        return {
          ...prev,
          mods: [...prev.mods, ...(needToAddMod ? [newModManifest] : [])]
        };
      })
    );

    if (!needToAddMod) {
      if (useTempMiddleware) {
        await fse.remove(tempFile);
      }
      return;
    }

    if (!useTempMiddleware) {
      try {
        await fse.access(destFile);
        const murmur2 = await getFileMurmurHash2(destFile);
        if (murmur2 !== mainModData.data.packageFingerprint) {
          await downloadFile(
            destFile,
            mainModData.data.downloadUrl,
            onProgress
          );
        }
      } catch {
        await downloadFile(destFile, mainModData.data.downloadUrl, onProgress);
      }
    } else {
      await fse.move(tempFile, destFile, { overwrite: true });
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
                installDeps,
                onProgress,
                useTempMiddleware
              )
            );
          }
        },
        { concurrency: 2 }
      );
    }
  };
}

export const deleteMod = (instanceName, mod) => {
  return async (dispatch, getState) => {
    const instancesPath = _getInstancesPath(getState());
    await dispatch(
      updateInstanceConfig(instanceName, prev => ({
        ...prev,
        mods: prev.mods.filter(m => m.fileName !== mod.fileName)
      }))
    );
    await fse.remove(
      path.join(instancesPath, instanceName, 'mods', mod.fileName)
    );
  };
};

export const updateMod = (
  instanceName,
  mod,
  fileID,
  gameVersion,
  onProgress
) => {
  return async dispatch => {
    await dispatch(
      installMod(
        mod.projectID,
        fileID,
        instanceName,
        gameVersion,
        false,
        onProgress,
        true
      )
    );
    await dispatch(deleteMod(instanceName, mod));
  };
};

export const initLatestMods = instanceName => {
  return async (dispatch, getState) => {
    const state = getState();
    const instance = _getInstance(state)(instanceName);
    const { latestModManifests } = state;

    const modIds = instance?.mods
      ?.filter(v => v.projectID)
      ?.map(v => v.projectID);

    // Check which mods need to be initialized
    const modsToInit = modIds?.filter(v => {
      return !latestModManifests[v];
    });

    if (!modsToInit || modsToInit?.length === 0) return;

    // Need to split in multiple requests
    const manifests = await pMap(
      modsToInit,
      async mod => {
        const { data } = await getAddonFiles(mod);
        return { projectID: mod, data };
      },
      { concurrency: 40 }
    );
    const manifestsObj = {};
    manifests.map(v => {
      // Find latest version for each mod
      const [latestMod] =
        getPatchedInstanceType(instance) === FORGE || v.projectID === 361988
          ? filterForgeFilesByVersion(v.data, instance.modloader[1])
          : filterFabricFilesByVersion(v.data, instance.modloader[1]);
      if (latestMod) {
        manifestsObj[v.projectID] = latestMod;
      }
      return null;
    });

    dispatch(updateLatestModManifests(manifestsObj));
  };
};

export const getAppLatestVersion = () => {
  return async () => {
    const { data: latestReleases } = await axios.get(
      'https://api.github.com/repos/gorilla-devs/GDLauncher/releases'
    );

    const latestPrerelease = latestReleases.find(v => v.prerelease);
    const latestStablerelease = latestReleases.find(v => !v.prerelease);

    const appData = parse(await ipcRenderer.invoke('getAppdataPath'));
    let releaseChannel = 0;

    try {
      const rChannel = await fs.readFile(
        path.join(appData, 'gdlauncher_next', 'rChannel')
      );
      releaseChannel = rChannel.toString();
    } catch {
      // swallow error
    }

    const installedVersion = parse(await ipcRenderer.invoke('getAppVersion'));
    const isAppUpdated = r => !lt(installedVersion, parse(r.tag_name));

    if (!isAppUpdated(latestStablerelease)) {
      return latestStablerelease;
    }
    if (!isAppUpdated(latestPrerelease) && releaseChannel !== 0) {
      return latestPrerelease;
    }

    return false;
  };
};

export const checkForPortableUpdates = () => {
  return async (dispatch, getState) => {
    const state = getState();
    const baseFolder = await ipcRenderer.invoke('getExecutablePath');

    const tempFolder = path.join(_getTempPath(state), `update`);

    const latestVersion = await getAppLatestVersion();

    // Latest version has a value only if the user is not using the latest
    if (latestVersion) {
      // eslint-disable-next-line
      const baseAssetUrl = `https://github.com/gorilla-devs/GDLauncher/releases/download/${latestVersion?.tag_name}`;
      const { data: latestManifest } = await axios.get(
        `${baseAssetUrl}/${process.platform}_latest.json`
      );
      // Cleanup all files that are not required for the update
      await makeDir(tempFolder);

      const filesToUpdate = (
        await Promise.all(
          latestManifest.map(async file => {
            const fileOnDisk = path.join(baseFolder, ...file.file);
            let needsDownload = false;
            try {
              // Check if files exists
              await originalFs.promises.stat(fileOnDisk);

              const fileOnDiskSha1 = await getFileHash(fileOnDisk);

              if (fileOnDiskSha1.toString() !== file.sha1) {
                throw new Error('SHA1 Mismatch', file.compressedFile);
              }
            } catch (err) {
              needsDownload = true;
            }
            if (needsDownload) {
              return file;
            }
            return null;
          })
        )
      ).filter(_ => _);

      const tempFiles = await getFilesRecursive(tempFolder);
      await Promise.all(
        tempFiles.map(async tempFile => {
          const tempFileRelativePath = path.relative(tempFolder, tempFile);
          const isNeeded = filesToUpdate.find(
            v => path.join(...v.file) === tempFileRelativePath
          );
          if (!isNeeded) {
            await fse.remove(tempFile);
          }
        })
      );

      await pMap(
        filesToUpdate,
        async file => {
          const compressedFile = path.join(tempFolder, file.compressedFile);
          const destinationPath = path.join(tempFolder, ...file.file);
          try {
            // Check if files exists
            await originalFs.promises.access(destinationPath);
            const fileSha1 = await getFileHash(destinationPath);
            if (fileSha1.toString() !== file.sha1) {
              throw new Error('SHA1 mismatch', file.compressedFile);
            }
          } catch {
            try {
              try {
                await originalFs.promises.access(compressedFile);
                const fileSha1 = await getFileHash(compressedFile);
                if (fileSha1.toString() === file.sha1) {
                  return;
                }
              } catch {
                // Nothing, just go ahead and download since sha1 mismatch
              }

              // Try to download 5 times
              const maxTries = 5;
              let sha1Matched = false;
              while (maxTries <= 5 && !sha1Matched) {
                // eslint-disable-next-line
                await downloadFile(
                  compressedFile,
                  `${baseAssetUrl}/${file.compressedFile}`
                );
                // eslint-disable-next-line
                const fileSha1 = await getFileHash(compressedFile);
                if (fileSha1.toString() === file.compressedSha1) {
                  sha1Matched = true;
                }
              }

              if (!sha1Matched) {
                throw new Error(`Could not download ${file.compressedSha1}`);
              }

              const gzip = zlib.createGunzip();
              const source = originalFs.createReadStream(compressedFile);

              await makeDir(path.dirname(destinationPath));
              const destination = originalFs.createWriteStream(destinationPath);

              await new Promise((resolve, reject) => {
                pipeline(source, gzip, destination, err => {
                  if (err) {
                    reject(err);
                  }
                  resolve();
                });
              });

              await fse.remove(compressedFile);
            } catch (err) {
              throw new Error(err);
            }
          }
        },
        { concurrency: 3 }
      );
    }
    return latestVersion;
  };
};
