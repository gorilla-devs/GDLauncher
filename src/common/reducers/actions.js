import axios from 'axios';
import path from 'path';
import { ipcRenderer } from 'electron';
import { v5 as uuid } from 'uuid';
import { machineId } from 'node-machine-id';
import fse, { remove } from 'fs-extra';
import coerce from 'semver/functions/coerce';
import gte from 'semver/functions/gte';
import lt from 'semver/functions/lt';
import lte from 'semver/functions/lte';
import gt from 'semver/functions/gt';
import log from 'electron-log';
import omitBy from 'lodash/omitBy';
import { pipeline } from 'stream';
import he from 'he';
import zlib from 'zlib';
import lockfile from 'lockfile';
import omit from 'lodash/omit';
import Seven from 'node-7z';
import { push } from 'connected-react-router';
import { spawn } from 'child_process';
import symlink from 'symlink-dir';
import fss, { promises as fs } from 'fs';
import originalFs from 'original-fs';
import pMap from 'p-map';
import makeDir from 'make-dir';
import { major, minor, patch, prerelease } from 'semver';
import { generate as generateRandomString } from 'randomstring';
import { XMLParser } from 'fast-xml-parser';
import * as ActionTypes from './actionTypes';
import {
  ACCOUNT_MICROSOFT,
  ACCOUNT_MOJANG,
  CURSEFORGE,
  FABRIC,
  FMLLIBS_FORGE_BASE_URL,
  FMLLIBS_OUR_BASE_URL,
  FORGE,
  FTB,
  GDL_LEGACYJAVAFIXER_MOD_URL,
  LATEST_JAVA_VERSION,
  MC_RESOURCES_URL,
  MC_STARTUP_METHODS,
  MICROSOFT_OAUTH_CLIENT_ID,
  MICROSOFT_OAUTH_REDIRECT_URL,
  NEWS_URL
} from '../utils/constants';
import {
  getAddon,
  getAddonCategories,
  getAddonFile,
  getAddonFiles,
  getAddonsByFingerprint,
  getCFVersionIds,
  getFabricJson,
  getFabricManifest,
  getForgeManifest,
  getFTBModpackVersionData,
  getJavaLatestManifest,
  getJavaManifest,
  getMcManifest,
  getMultipleAddons,
  mcAuthenticate,
  mcInvalidate,
  mcRefresh,
  mcValidate,
  msAuthenticateMinecraft,
  msAuthenticateXBL,
  msAuthenticateXSTS,
  msExchangeCodeForAccessToken,
  msMinecraftProfile,
  msOAuthRefresh
} from '../api';
import {
  _getAccounts,
  _getAssetsPath,
  _getCurrentAccount,
  _getCurrentDownloadItem,
  _getDataStorePath,
  _getInstance,
  _getInstancesPath,
  _getJavaPath,
  _getLibrariesPath,
  _getMinecraftVersionsPath,
  _getTempPath
} from '../utils/selectors';
import {
  convertCompletePathToInstance,
  convertcurseForgeToCanonical,
  copyAssetsToLegacy,
  copyAssetsToResources,
  downloadAddonZip,
  extractAll,
  extractFabricVersionFromManifest,
  extractNatives,
  filterFabricFilesByVersion,
  filterForgeFilesByVersion,
  get7zPath,
  getFileHash,
  getFilesRecursive,
  getJVMArguments112,
  getJVMArguments113,
  getPatchedInstanceType,
  getPlayerSkin,
  isInstanceFolderPath,
  isMod,
  librariesMapper,
  mavenToArray,
  normalizeModData,
  patchForge113,
  reflect
} from '../../app/desktop/utils';
import ga from '../utils/analytics';
import {
  downloadFile,
  downloadInstanceFiles
} from '../../app/desktop/utils/downloader';
import {
  addQuotes,
  getFileMurmurHash2,
  getSize,
  makeInstanceRestorePoint,
  removeDuplicates,
  replaceLibraryDirectory
} from '../utils';
import { UPDATE_CONCURRENT_DOWNLOADS } from './settings/actionTypes';
import { UPDATE_MODAL } from './modals/actionTypes';
import PromiseQueue from '../../app/desktop/utils/PromiseQueue';
import fmlLibsMapping from '../../app/desktop/utils/fmllibs';
import { openModal, closeModal } from './modals/actions';
import forgePatcher from '../utils/forgePatcher';
import browserDownload from '../utils/browserDownload';

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
    const getJavaLatestManifestVersions = async () => {
      const java = (await getJavaLatestManifest()).data;
      dispatch({
        type: ActionTypes.UPDATE_JAVA_LATEST_MANIFEST,
        data: java
      });
      return java;
    };
    const getAddonCategoriesVersions = async () => {
      const curseforgeCategories = await getAddonCategories();
      dispatch({
        type: ActionTypes.UPDATE_CURSEFORGE_CATEGORIES_MANIFEST,
        data: curseforgeCategories
      });
      return curseforgeCategories;
    };
    const getCurseForgeVersionIds = async () => {
      const versionIds = await getCFVersionIds();
      const hm = {};
      for (const v of versionIds) {
        for (const version of v.versions) {
          hm[version] = v.type;
        }
      }

      dispatch({
        type: ActionTypes.UPDATE_CURSEFORGE_VERSION_IDS,
        data: hm
      });
      return hm;
    };
    const getForgeVersions = async () => {
      const forge = (await getForgeManifest()).data;
      const forgeVersions = {};
      // Looping over vanilla versions, create a new entry in forge object
      // and add to it all correct versions
      mc.versions.forEach(v => {
        if (forge[v.id]) {
          // Monkeypatch manifest since forge changed the format

          if (v.id.includes('-'))
            forge[v.id].map(forgeV => forgePatcher(forgeV, v.id));
          else forgeVersions[v.id] = forge[v.id];
        }
      });

      dispatch({
        type: ActionTypes.UPDATE_FORGE_MANIFEST,
        data: omitBy(forgeVersions, v => v.length === 0)
      });
      return omitBy(forgeVersions, v => v.length === 0);
    };
    // Using reflect to avoid rejection
    const [fabric, java, javaLatest, categories, forge, CFVersionIds] =
      await Promise.all([
        reflect(getFabricVersions()),
        reflect(getJavaManifestVersions()),
        reflect(getJavaLatestManifestVersions()),
        reflect(getAddonCategoriesVersions()),
        reflect(getForgeVersions()),
        reflect(getCurseForgeVersionIds())
      ]);

    if (fabric.e || java.e || categories.e || forge.e || CFVersionIds.e) {
      console.error(fabric, java, categories, forge);
    }

    return {
      mc: mc || app.vanillaManifest,
      fabric: fabric.status ? fabric.v : app.fabricManifest,
      java: java.status ? java.v : app.javaManifest,
      javaLatest: javaLatest.status ? javaLatest.v : app.javaLatestManifest,
      categories: categories.status ? categories.v : app.curseforgeCategories,
      forge: forge.status ? forge.v : app.forgeManifest,
      curseforgeVersionIds: CFVersionIds.status
        ? CFVersionIds.v
        : app.curseforgeVersionIds
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
        const { data: newsXml } = await axios.get(NEWS_URL);
        const parser = new XMLParser();
        const newsArr =
          parser.parse(newsXml)?.rss?.channel?.item?.map(newsEntry => ({
            title: newsEntry.title,
            description: newsEntry.description,
            image: `https://www.minecraft.net${newsEntry.imageURL}`,
            url: newsEntry.link,
            guid: newsEntry.guid
          })) || [];
        dispatch({
          type: ActionTypes.UPDATE_NEWS,
          news: newsArr
            .map(v => ({
              ...v,
              title: he.decode(v?.title),
              description: he.decode(v?.description)
            }))
            .splice(0, 10)
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
        await dispatch(
          accounts[i].accountType === ACCOUNT_MICROSOFT
            ? loginWithOAuthAccessToken()
            : loginWithAccessToken()
        );
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
    ipcRenderer.invoke('update-progress-bar', percentage);
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
      let data = null;
      try {
        ({ data } = await mcAuthenticate(username, password, clientToken));
        data.accountType = ACCOUNT_MOJANG;
      } catch (err) {
        console.error(err);
        throw new Error('Invalid username or password.');
      }

      if (!data?.selectedProfile?.id) {
        throw new Error("It looks like you didn't buy the game.");
      }
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

export function loginWithOAuthAccessToken(redirect = true) {
  return async (dispatch, getState) => {
    const state = getState();
    const currentAccount = _getCurrentAccount(state);
    const {
      accessToken,
      selectedProfile,
      msOAuth: { msRefreshToken, msExpiresAt },
      user: { username: mcUserName }
    } = currentAccount;

    if (!accessToken) throw new Error();
    // Check if token already expired
    if (Date.now() >= msExpiresAt) {
      // Token expired
      try {
        const clientId = MICROSOFT_OAUTH_CLIENT_ID;

        let msRefreshedAccessToken = null;
        let msRefreshedRefreshToken = null;
        let msRefreshedExpiresIn = null;
        let msRefreshedExpiresAt = null;
        try {
          ({
            data: {
              access_token: msRefreshedAccessToken,
              refresh_token: msRefreshedRefreshToken,
              expires_in: msRefreshedExpiresIn
            }
          } = await msOAuthRefresh(clientId, msRefreshToken));
          msRefreshedExpiresAt = Date.now() + 1000 * msRefreshedExpiresIn;
        } catch (error) {
          console.error(error);
          throw new Error('Error occurred while refreshing Microsoft token.');
        }

        let xblToken = null;
        let userHash = null;
        try {
          ({
            data: {
              Token: xblToken,
              DisplayClaims: {
                xui: [{ uhs: userHash }]
              }
            }
          } = await msAuthenticateXBL(msRefreshedAccessToken));
        } catch (error) {
          console.error(error);
          throw new Error('Error occurred while logging in Xbox Live .');
        }

        let xstsToken = null;
        try {
          ({
            data: { Token: xstsToken }
          } = await msAuthenticateXSTS(xblToken));
        } catch (error) {
          console.error(error);
          throw new Error(
            'Error occurred while fetching token from Xbox Secure Token Service.'
          );
        }

        let mcRefreshedAccessToken = null;
        let mcRefreshedExpiresIn = null;
        let mcRefreshedExpiresAt = null;
        try {
          ({
            data: {
              access_token: mcRefreshedAccessToken,
              expires_in: mcRefreshedExpiresIn
            }
          } = await msAuthenticateMinecraft(userHash, xstsToken));
          mcRefreshedExpiresAt = Date.now() + 1000 * mcRefreshedExpiresIn;
        } catch (error) {
          console.error(error);
          throw new Error('Error occurred while logging in Minecraft.');
        }

        const skinUrl = await getPlayerSkin(selectedProfile.id);

        const account = {
          accountType: ACCOUNT_MICROSOFT,
          accessToken: mcRefreshedAccessToken,
          msOAuth: {
            msAccessToken: msRefreshedAccessToken,
            msRefreshToken: msRefreshedRefreshToken || msRefreshToken,
            msExpiresAt: msRefreshedExpiresAt,
            mcExpiresAt: mcRefreshedExpiresAt,
            xblToken,
            xstsToken,
            userHash
          },
          selectedProfile: {
            id: selectedProfile.id,
            name: selectedProfile.name
          },
          skin: skinUrl || undefined,
          user: {
            username: mcUserName
          }
        };

        dispatch(updateAccount(selectedProfile.id, account));
        dispatch(updateCurrentAccountId(selectedProfile.id));

        if (redirect) {
          dispatch(push('/home'));
        }
      } catch (error) {
        console.error(error);
        throw new Error(error);
      }
    } else {
      // Only reload skin
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
      } finally {
        if (redirect) {
          dispatch(push('/home'));
        }
      }
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
      data.accountType = ACCOUNT_MOJANG;
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

export function loginOAuth(redirect = true) {
  return async (dispatch, getState) => {
    const {
      app: { isNewUser /* , clientToken */ }
    } = getState();
    try {
      const clientId = MICROSOFT_OAUTH_CLIENT_ID;
      const codeVerifier = generateRandomString(128);
      const redirectUrl = MICROSOFT_OAUTH_REDIRECT_URL;

      let authCode = null;
      try {
        authCode = await ipcRenderer.invoke(
          'msLoginOAuth',
          clientId,
          codeVerifier,
          redirectUrl
        );
      } catch (error) {
        console.error(error);
        throw new Error('Error occurred while logging in Microsoft.');
      }

      let msAccessToken = null;
      let msRefreshToken = null;
      let msExpiresIn = null;
      let msExpiresAt = null;
      try {
        ({
          data: {
            access_token: msAccessToken,
            refresh_token: msRefreshToken,
            expires_in: msExpiresIn
          }
        } = await msExchangeCodeForAccessToken(
          clientId,
          redirectUrl,
          authCode,
          codeVerifier
        ));
        msExpiresAt = Date.now() + 1000 * msExpiresIn;
      } catch (error) {
        console.error(error);
        throw new Error('Error occurred while making logging in Microsoft .');
      }

      let xblToken = null;
      let userHash = null;
      try {
        ({
          data: {
            Token: xblToken,
            DisplayClaims: {
              xui: [{ uhs: userHash }]
            }
          }
        } = await msAuthenticateXBL(msAccessToken));
      } catch (error) {
        console.error(error);
        throw new Error('Error occurred while logging in Xbox Live .');
      }

      let xstsToken = null;
      try {
        ({
          data: { Token: xstsToken }
        } = await msAuthenticateXSTS(xblToken));
      } catch (error) {
        console.error(error);
        throw new Error(
          'Error occurred while fetching token from Xbox Secure Token Service.'
        );
      }

      let mcAccessToken = null;
      let mcExpiresIn = null;
      let mcExpiresAt = null;
      try {
        ({
          data: { access_token: mcAccessToken, expires_in: mcExpiresIn }
        } = await msAuthenticateMinecraft(userHash, xstsToken));
        mcExpiresAt = Date.now() + 1000 * mcExpiresIn;
      } catch (error) {
        console.error(error);
        throw new Error('Error occurred while logging in Minecraft.');
      }

      let mcUserId = null;
      let mcUserName = null;
      try {
        ({
          data: { id: mcUserId, name: mcUserName }
        } = await msMinecraftProfile(mcAccessToken));
      } catch (error) {
        console.error(error);
        if (error?.response?.status === 404) {
          throw new Error("It looks like you didn't buy the game.");
        }
        throw new Error('Error occurred while fetching Minecraft profile.');
      }

      const skinUrl = await getPlayerSkin(mcUserId);

      const account = {
        accountType: ACCOUNT_MICROSOFT,
        accessToken: mcAccessToken,
        msOAuth: {
          msAccessToken,
          msRefreshToken,
          msExpiresAt,
          mcExpiresAt,
          xblToken,
          xstsToken,
          userHash
        },
        selectedProfile: {
          id: mcUserId,
          name: mcUserName
        },
        skin: skinUrl || undefined,
        user: {
          username: mcUserName
        }
      };

      dispatch(updateAccount(mcUserId, account));
      dispatch(updateCurrentAccountId(mcUserId));

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
    } catch (error) {
      console.error(error);
      throw new Error(error);
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
      const tempConfigPath = path.join(
        _getInstancesPath(state),
        instanceName,
        'config_new_temp.json'
      );
      // Remove queue and name, they are augmented in the reducer and we don't want them in the config file
      const newConfig = updateFunction(omit(instance, ['queue', 'name']));
      const JsonString = JSON.stringify(newConfig);
      // Ensure that the new config is actually valid to write
      try {
        const isJson = JSON.parse(JsonString);
        if (!isJson || typeof isJson !== 'object') {
          const err = `Cannot write this JSON to ${instanceName}. Not an object`;
          log.error(err);
          throw new Error(err);
        }
      } catch {
        const err = `Cannot write this JSON to ${instanceName}. Not parsable`;
        log.error(err, newConfig);
        throw new Error(err);
      }

      const writeFileToDisk = async (content, tempP, p) => {
        await new Promise((resolve, reject) => {
          fss.open(tempP, 'w', async (err, fd) => {
            if (err || !fd) reject(err);

            const buffer = Buffer.from(content);
            fss.write(
              fd,
              buffer,
              0,
              buffer.length,
              null,
              (err1, bytesWritten, writtenBuffer) => {
                if (err1) reject(err1);

                if (
                  buffer.length !== bytesWritten ||
                  Buffer.compare(buffer, writtenBuffer) !== 0
                ) {
                  reject(new Error('Content corrupted'));
                }

                fss.close(fd, () => resolve());
              }
            );
          });
        });

        const readBuff = Buffer.alloc(50);
        const newFile = await fs.open(tempP, 'r');
        await newFile.read(readBuff, 0, 50, null);

        if (readBuff.every(v => v === 0)) {
          throw new Error('Corrupted file');
        }
        await fs.rename(tempP, p);
      };

      try {
        await fs.access(configPath);
        await writeFileToDisk(JsonString, tempConfigPath, configPath);
      } catch {
        if (forceWrite) {
          await writeFileToDisk(JsonString, tempConfigPath, configPath);
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
  loader,
  manifest,
  background,
  timePlayed,
  settings = {},
  updateOptions
) {
  return async (dispatch, getState) => {
    const state = getState();
    const { currentDownload } = state;
    const patchedSettings =
      typeof settings === 'object' && settings !== null ? settings : {};

    const { isUpdate, bypassCopy } = updateOptions || {};

    dispatch({
      type: ActionTypes.ADD_DOWNLOAD_TO_QUEUE,
      instanceName,
      loader,
      manifest,
      background,
      isUpdate,
      bypassCopy,
      ...patchedSettings
    });

    await makeDir(path.join(_getInstancesPath(state), instanceName));
    lockfile.lock(
      path.join(_getInstancesPath(state), instanceName, 'installing.lock'),
      err => {
        if (err) console.error(err);
      }
    );

    dispatch(
      updateInstanceConfig(
        instanceName,
        prev => {
          return {
            ...(prev || {}),
            loader,
            timePlayed: prev.timePlayed || timePlayed || 0,
            background,
            mods: prev.mods || [],
            ...patchedSettings
          };
        },
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
    const { loader } = _getCurrentDownloadItem(state);

    dispatch(updateDownloadStatus(instanceName, 'Downloading fabric files...'));

    let fabricJson;
    const fabricJsonPath = path.join(
      _getLibrariesPath(state),
      'net',
      'fabricmc',
      loader?.mcVersion,
      loader?.loaderVersion,
      'fabric.json'
    );
    try {
      fabricJson = await fse.readJson(fabricJsonPath);
    } catch (err) {
      fabricJson = (await getFabricJson(loader)).data;
      await fse.outputJson(fabricJsonPath, fabricJson);
    }

    const libraries = librariesMapper(
      fabricJson.libraries,
      _getLibrariesPath(state)
    );

    let prev = 0;
    const updatePercentage = downloaded => {
      const percentage = (downloaded * 100) / libraries.length;
      const progress = parseInt(percentage, 10);
      if (progress !== prev) {
        prev = progress;
        dispatch(updateDownloadProgress(progress));
      }
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
    const { loader } = _getCurrentDownloadItem(state);
    const forgeJson = {};

    const forgeJsonPath = path.join(
      _getLibrariesPath(state),
      'net',
      'minecraftforge',
      loader?.loaderVersion,
      `${loader?.loaderVersion}.json`
    );

    const mcJsonPath = path.join(
      _getMinecraftVersionsPath(state),
      `${loader?.mcVersion}.json`
    );

    const sevenZipPath = await get7zPath();
    const pre152 = lte(coerce(loader?.mcVersion), coerce('1.5.2'));
    const pre132 = lte(coerce(loader?.mcVersion), coerce('1.3.2'));
    const baseUrl = 'https://maven.minecraftforge.net/net/minecraftforge/forge';
    const tempInstaller = path.join(
      _getTempPath(state),
      `${loader?.loaderVersion}.jar`
    );
    const expectedInstaller = path.join(
      _getDataStorePath(state),
      'forgeInstallers',
      `${loader?.loaderVersion}.jar`
    );

    const extractSpecificFile = async from => {
      await extractAll(tempInstaller, _getTempPath(state), {
        $cherryPick: from
      });
    };

    try {
      await fs.access(expectedInstaller);
      if (!pre152) {
        await fs.access(forgeJsonPath);
      }
      const { data: hashes } = await axios.get(
        `https://files.minecraftforge.net/net/minecraftforge/forge/${loader?.loaderVersion}/meta.json`
      );
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
      let prev = 0;
      await downloadFile(
        tempInstaller,
        `${baseUrl}/${loader?.loaderVersion}/forge-${loader?.loaderVersion}-${urlTerminal}`,
        p => {
          const progress = parseInt(p, 10) / 100;
          if (progress !== prev) {
            prev = progress;
            dispatch(updateDownloadProgress(p));
          }
        }
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

      await fse.remove(path.join(_getTempPath(state), 'install_profile.json'));

      await fse.outputJson(forgeJsonPath, forgeJson);

      let skipForgeFilter = true;

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
      } else if (forgeJson.install.path) {
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
      } else {
        // Forge 1.17+
        skipForgeFilter = false;
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
            !skipForgeFilter ||
            (!v.name.includes('net.minecraftforge:forge:') &&
              !v.name.includes('net.minecraftforge:minecraftforge:'))
        ),
        _getLibrariesPath(state)
      );

      let prev = 0;
      const updatePercentage = downloaded => {
        const percentage = (downloaded * 100) / libraries.length;
        const progress = parseInt(percentage, 10);
        if (progress !== prev) {
          prev = progress;
          dispatch(updateDownloadProgress(progress));
        }
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

        const universalPath = forgeJson.install.libraries.find(v =>
          (v.name || '').startsWith('net.minecraftforge:forge')
        )?.name;

        await fse.move(
          path.join(_getTempPath(state), 'data', 'client.lzma'),
          path.join(
            _getLibrariesPath(state),
            ...mavenToArray(
              forgeJson.install.path || universalPath,
              '-clientdata',
              '.lzma'
            )
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
          expectedInstaller,
          mcJsonPath,
          universalPath,
          _getJavaPath(state)(8),
          (d, t) => dispatch(updateDownloadProgress((d * 100) / t))
        );
      }
    };

    if (gt(coerce(loader?.mcVersion), coerce('1.5.2'))) {
      await installForgePost152();
    } else {
      // Download necessary libs
      const fmllibs = fmlLibsMapping[loader?.mcVersion];
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
        `${loader?.mcVersion}.jar`
      );
      const mcJarForgePath = path.join(
        _getMinecraftVersionsPath(state),
        `${loader?.loaderVersion}.jar`
      );
      await fse.copy(mcJarPath, mcJarForgePath);

      const metaInfDeletion = Seven.delete(mcJarForgePath, 'META-INF', {
        $bin: sevenZipPath,
        yes: true,
        $spawnOptions: { shell: true }
      });
      await new Promise((resolve, reject) => {
        metaInfDeletion.on('end', () => {
          resolve();
        });
        metaInfDeletion.on('error', error => {
          reject(error.stderr);
        });
      });

      await fse.remove(path.join(_getTempPath(state), loader?.loaderVersion));

      // This is garbage, need to use a stream somehow to directly inject data from/to jar
      await extractAll(
        tempInstaller,
        path.join(_getTempPath(state), loader?.loaderVersion)
      );

      dispatch(updateDownloadProgress(50));

      const updatedFiles = Seven.add(
        mcJarForgePath,
        `${path.join(_getTempPath(state), loader?.loaderVersion)}/*`,
        {
          $bin: sevenZipPath,
          yes: true,
          $spawnOptions: { shell: true }
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

      await fse.remove(path.join(_getTempPath(state), loader?.loaderVersion));
    }

    await fse.remove(tempInstaller);
  };
}

export function processFTBManifest(instanceName) {
  return async (dispatch, getState) => {
    const state = getState();
    const { manifest } = _getCurrentDownloadItem(state);
    const instancesPath = _getInstancesPath(state);
    const instancePath = path.join(instancesPath, instanceName);
    const fileHashes = {};

    const { files: allFiles } = manifest;
    const concurrency = state.settings.concurrentDownloads;

    const files = allFiles.filter(v => v.url && v.url !== '');
    const CFFiles = allFiles.filter(v => !v.url || v.url === '');

    dispatch(updateDownloadStatus(instanceName, 'Downloading CF files...'));
    const addonsHashmap = {};
    const addonsFilesHashmap = {};

    // DOWNLOAD CF FILES

    const _getAddons = async () => {
      console.log(CFFiles.map(v => v.curseforge?.project));
      const addons = await getMultipleAddons(
        CFFiles.map(v => v.curseforge?.project)
      );

      addons.forEach(v => {
        addonsHashmap[v.id] = v;
      });
    };

    const _getAddonFiles = async () => {
      await pMap(
        CFFiles,
        async item => {
          const modManifest = await getAddonFile(
            item.curseforge?.project,
            item.curseforge?.file
          );

          addonsFilesHashmap[item.curseforge?.project] = modManifest;
        },
        { concurrency: concurrency + 10 }
      );
    };

    await Promise.all([_getAddons(), _getAddonFiles()]);

    let modManifests = [];
    const optedOutMods = [];
    await pMap(
      CFFiles,
      async item => {
        if (!addonsHashmap[item.curseforge?.project]) return;
        let ok = false;
        let tries = 0;
        /* eslint-disable no-await-in-loop */
        do {
          tries += 1;
          if (tries !== 1) {
            await new Promise(resolve => setTimeout(resolve, 5000));
          }

          const addon = addonsHashmap[item.curseforge?.project];
          const isResourcePack = addon.classId === 12;
          const modManifest = addonsFilesHashmap[item.curseforge?.project];
          const destFile = path.join(
            _getInstancesPath(state),
            instanceName,
            isResourcePack ? 'resourcepacks' : 'mods',
            modManifest.fileName
          );

          const fileExists = await fse.pathExists(destFile);

          if (!fileExists) {
            if (!modManifest.downloadUrl) {
              const normalizedModData = normalizeModData(
                modManifest,
                item.curseforge?.project,
                addon.name
              );

              optedOutMods.push({ addon, modManifest: normalizedModData });
              return;
            }
            await downloadFile(destFile, modManifest.downloadUrl);
            modManifests = modManifests.concat(
              normalizeModData(
                modManifest,
                item.curseforge?.project,
                addon.name
              )
            );
          }
          const percentage = (modManifests.length * 100) / CFFiles.length - 1;

          dispatch(updateDownloadProgress(percentage > 0 ? percentage : 0));
          ok = true;
        } while (!ok && tries <= 3);
        /* eslint-enable no-await-in-loop */
      },
      { concurrency }
    );

    if (optedOutMods.length) {
      await new Promise((resolve, reject) => {
        dispatch(
          openModal('OptedOutModsList', {
            optedOutMods,
            instancePath: path.join(_getInstancesPath(state), instanceName),
            resolve,
            reject,
            abortCallback: () => {
              setTimeout(
                () => reject(new Error('Download Aborted by the user')),
                300
              );
            }
          })
        );
      });
    }

    modManifests = modManifests.concat(
      ...optedOutMods.map(v =>
        normalizeModData(v.modManifest, v.modManifest.projectID, v.addon.name)
      )
    );

    // DOWNLOAD FTB FILES

    let prev = 0;
    const updatePercentage = downloaded => {
      const percentage = (downloaded * 100) / files.length;
      const progress = parseInt(percentage, 10);
      if (progress !== prev) {
        prev = progress;
        dispatch(updateDownloadProgress(progress));
      }
    };

    let mappedFiles = files.map(async item => {
      return {
        ...item,
        path: path.join(instancePath, item.path, item.name)
      };
    });
    dispatch(updateDownloadStatus(instanceName, 'Downloading FTB files...'));
    await downloadInstanceFiles(
      mappedFiles,
      updatePercentage,
      state.settings.concurrentDownloads
    );

    mappedFiles = await pMap(
      files,
      async item => {
        const filePath = path.join(instancePath, item.path, item.name);
        const hash = await getFileMurmurHash2(filePath);

        return {
          ...item,
          path: path.join(instancePath, item.path, item.name),
          murmur2: hash
        };
      },
      { concurrency: 10 }
    );

    dispatch(updateDownloadStatus(instanceName, 'Finalizing FTB files...'));

    const data = await getAddonsByFingerprint(
      Object.values(mappedFiles).map(v => v.murmur2)
    );
    const { exactMatches } = data || {};

    for (const item of exactMatches) {
      if (item.file) {
        fileHashes[item.file.fileFingerprint] = item;
      }
    }

    mappedFiles = mappedFiles.filter(
      v => v.name.split(/\.(?=[^.]+$)/)[1] === 'jar'
    );

    await pMap(
      mappedFiles,
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
            const exactMatch = fileHashes[item.murmur2];

            if (exactMatch) {
              const { modId } = exactMatch.file;
              try {
                const addon = await getAddon(modId);
                const mod = normalizeModData(
                  exactMatch.file,
                  modId,
                  addon.name
                );
                mod.fileName = path.basename(item.name);
                modManifests = modManifests.concat(mod);
              } catch {
                modManifests = modManifests.concat({
                  fileName: path.basename(item.name),
                  displayName: path.basename(item.name),
                  packageFingerprint: item.murmur2
                });
              }
            } else {
              modManifests = modManifests.concat({
                fileName: item.name,
                displayName: item.name,
                version: item.version,
                downloadUrl: item.url,
                FTBmodId: item.id
              });
            }

            const percentage = (modManifests.length * 100) / mappedFiles.length;

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

    await dispatch(
      updateInstanceConfig(instanceName, config => {
        return {
          ...config,
          mods: [...(config.mods || []), ...modManifests]
        };
      })
    );

    await fse.remove(path.join(_getTempPath(state), instanceName));
  };
}

export function processForgeManifest(instanceName) {
  return async (dispatch, getState) => {
    const state = getState();
    const { manifest, loader } = _getCurrentDownloadItem(state);
    const concurrency = state.settings.concurrentDownloads;

    dispatch(updateDownloadStatus(instanceName, 'Downloading mods...'));

    const addonsHashmap = {};
    const addonsFilesHashmap = {};

    const _getAddons = async () => {
      const addons = await getMultipleAddons(
        manifest.files.map(v => v.projectID)
      );

      addons.forEach(v => {
        addonsHashmap[v.id] = v;
      });
    };

    const _getAddonFiles = async () => {
      await pMap(
        manifest.files,
        async item => {
          const modManifest = await getAddonFile(item.projectID, item.fileID);

          addonsFilesHashmap[item.projectID] = modManifest;
        },
        { concurrency: concurrency + 10 }
      );
    };

    await Promise.all([_getAddons(), _getAddonFiles()]);

    let modManifests = [];
    const optedOutMods = [];
    await pMap(
      manifest.files,
      async item => {
        if (!addonsHashmap[item.projectID]) return;
        let ok = false;
        let tries = 0;
        /* eslint-disable no-await-in-loop */
        do {
          tries += 1;
          if (tries !== 1) {
            await new Promise(resolve => setTimeout(resolve, 5000));
          }

          const addon = addonsHashmap[item.projectID];
          const isResourcePack = addon.classId === 12;
          const modManifest = addonsFilesHashmap[item.projectID];
          const destFile = path.join(
            _getInstancesPath(state),
            instanceName,
            isResourcePack ? 'resourcepacks' : 'mods',
            modManifest.fileName
          );

          const fileExists = await fse.pathExists(destFile);

          if (!fileExists) {
            if (!modManifest.downloadUrl) {
              const normalizedModData = normalizeModData(
                modManifest,
                item.projectID,
                addon.name
              );

              optedOutMods.push({ addon, modManifest: normalizedModData });
              return;
            }
            await downloadFile(destFile, modManifest.downloadUrl);
            modManifests = modManifests.concat(
              normalizeModData(modManifest, item.projectID, addon.name)
            );
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

    if (optedOutMods.length) {
      await new Promise((resolve, reject) => {
        dispatch(
          openModal('OptedOutModsList', {
            optedOutMods,
            instancePath: path.join(_getInstancesPath(state), instanceName),
            resolve,
            reject,
            abortCallback: () => {
              setTimeout(
                () => reject(new Error('Download Aborted by the user')),
                300
              );
            }
          })
        );
      });
    }

    modManifests = modManifests.concat(
      ...optedOutMods.map(v =>
        normalizeModData(v.modManifest, v.modManifest.projectID, v.addon.name)
      )
    );

    let validAddon = false;
    const addonPathZip = path.join(
      _getTempPath(state),
      instanceName,
      'addon.zip'
    );

    try {
      await fs.stat(addonPathZip);
      validAddon = true;
    } catch {
      // If project and file id are provided, we download it on the spot
      if (loader.projectID && loader.fileID) {
        const data = await getAddonFile(loader.projectID, loader.fileID);
        try {
          await downloadFile(addonPathZip, data.downloadUrl);
          validAddon = true;
        } catch {
          // NO-OP
        }
      }
    }

    if (validAddon) {
      dispatch(updateDownloadStatus(instanceName, 'Copying overrides...'));
      let progress = 0;
      await extractAll(
        addonPathZip,
        path.join(_getTempPath(state), instanceName),
        {
          recursive: true,
          $cherryPick: 'overrides',
          $progress: true
        },
        {
          progress: percent => {
            if (percent !== progress) {
              progress = percent;
              dispatch(updateDownloadProgress(percent));
            }
          }
        }
      );

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
    } else {
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
    }

    await fse.remove(path.join(_getTempPath(state), instanceName));
  };
}

export function downloadInstance(instanceName) {
  return async (dispatch, getState) => {
    const state = getState();
    const { loader, manifest, isUpdate, bypassCopy } =
      _getCurrentDownloadItem(state);
    const {
      app: {
        vanillaManifest: { versions: mcVersions }
      }
    } = state;

    const tempPath = _getTempPath(state);
    const tempInstancePath = path.join(tempPath, `${instanceName}__RESTORE`);

    try {
      const instancesPath = _getInstancesPath(getState());

      if (isUpdate && !bypassCopy) {
        dispatch(
          updateDownloadStatus(instanceName, 'Creating restore point...')
        );

        const oldInstancePath = path.join(instancesPath, instanceName);

        const sizeSrc = await getSize(oldInstancePath);

        const interval = setInterval(async () => {
          try {
            const sizeDest = await getSize(tempInstancePath);
            const progress = (100 * sizeDest) / sizeSrc;
            dispatch(updateDownloadProgress(progress));
          } catch {
            // Doesn't matter too much
          }
        }, 400);

        try {
          await makeInstanceRestorePoint(
            tempInstancePath,
            instancesPath,
            instanceName
          );
          clearInterval(interval);
        } catch (e) {
          console.warn(e);
          clearInterval(interval);
        }
      }

      dispatch(updateDownloadStatus(instanceName, 'Downloading game files...'));

      const mcVersion = loader?.mcVersion;

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

      if (mcJson.logging) {
        const {
          sha1: loggingHash,
          id: loggingId,
          url: loggingUrl
        } = mcJson.logging.client.file;
        await downloadFile(
          path.join(
            _getAssetsPath(state),
            'objects',
            loggingHash.substring(0, 2),
            loggingId
          ),
          loggingUrl
        );
      }

      const libraries = librariesMapper(
        mcJson.libraries,
        _getLibrariesPath(state)
      );

      let prev = 0;
      const updatePercentage = downloaded => {
        const percentage =
          (downloaded * 100) / (assets.length + libraries.length + 1);

        const progress = parseInt(percentage, 10);

        if (progress !== prev) {
          prev = progress;
          dispatch(updateDownloadProgress(progress));
        }
      };

      await downloadInstanceFiles(
        [...libraries, ...assets, mcMainFile],
        updatePercentage,
        state.settings.concurrentDownloads
      );

      // Wait 400ms to avoid "The process cannot access the file because it is being used by another process."
      await new Promise(resolve => setTimeout(() => resolve(), 1000));

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
      if (loader?.loaderType === FABRIC) {
        await dispatch(downloadFabric(instanceName));
      } else if (loader?.loaderType === FORGE) {
        await dispatch(downloadForge(instanceName));
      }

      // analyze source and do it for ftb and forge

      if (manifest && loader?.source === FTB)
        await dispatch(processFTBManifest(instanceName));
      else if (manifest && loader?.source === CURSEFORGE)
        await dispatch(processForgeManifest(instanceName));

      dispatch(updateDownloadProgress(0));

      // Be aware that from this line the installer lock might be unlocked!

      await dispatch(removeDownloadFromQueue(instanceName));
      dispatch(addNextInstanceToCurrentDownload());
    } catch (err) {
      console.error(err);
      // Show error modal and decide what to do
      dispatch(
        openModal('InstanceDownloadFailed', {
          instanceName,
          preventClose: true,
          error: err,
          isUpdate
        })
      );
    } finally {
      await remove(tempInstancePath);
    }
  };
}

export const changeModpackVersion = (instanceName, newModpackData) => {
  return async (dispatch, getState) => {
    const state = getState();
    const instance = _getInstance(state)(instanceName);
    const tempPath = _getTempPath(state);
    const instancePath = path.join(_getInstancesPath(state), instanceName);

    if (instance.loader.source === CURSEFORGE) {
      const addon = await getAddon(instance.loader?.projectID);

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

      const modsprojectIds = (manifest?.files || []).map(v => v?.projectID);

      dispatch(
        updateInstanceConfig(instanceName, prev =>
          omit(
            {
              ...prev,
              mods: prev.mods.filter(
                v => !modsprojectIds.includes(v?.projectID)
              )
            },
            ['overrides']
          )
        )
      );

      await Promise.all(
        modsprojectIds.map(async projectID => {
          const modFound = instance.mods?.find(v => v?.projectID === projectID);
          if (modFound?.fileName) {
            try {
              await fs.stat(
                path.join(instancePath, 'mods', modFound?.fileName)
              );
              await fse.remove(
                path.join(instancePath, 'mods', modFound?.fileName)
              );
            } catch {
              // Swallow error
            }
          }
        })
      );

      const imageURL = addon?.logo?.thumbnailUrl;

      const newManifest = await downloadAddonZip(
        instance.loader?.projectID,
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

      let loaderVersion;
      if (instance.loader?.loaderType === FABRIC) {
        loaderVersion = extractFabricVersionFromManifest(newManifest);
      } else {
        loaderVersion = convertcurseForgeToCanonical(
          newManifest.minecraft.modLoaders.find(v => v.primary).id,
          newManifest.minecraft.version,
          state.app.forgeManifest
        );
      }

      const loader = {
        loaderType: instance.loader?.loaderType,
        mcVersion: newManifest.minecraft.version,
        loaderVersion,
        fileID: instance.loader?.fileID,
        projectID: instance.loader?.projectID,
        source: instance.loader?.source
      };

      dispatch(
        addToQueue(
          instanceName,
          loader,
          newManifest,
          `background${path.extname(imageURL)}`,
          undefined,
          undefined,
          { isUpdate: true, bypassCopy: true }
        )
      );
    } else if (instance.loader.source === FTB) {
      const imageURL = newModpackData.imageUrl;

      await downloadFile(
        path.join(
          _getInstancesPath(state),
          instanceName,
          `background${path.extname(imageURL)}`
        ),
        imageURL
      );

      const newModpack = await getFTBModpackVersionData(
        instance.loader?.projectID,
        newModpackData.id
      );

      const loader = {
        loaderType: instance.loader?.loaderType,

        mcVersion: newModpack.targets[1].version,
        loaderVersion: convertcurseForgeToCanonical(
          `forge-${newModpack.targets[0].version}`,
          newModpack.targets[1].version,
          state.app.forgeManifest
        ),
        fileID: newModpack?.id,
        projectID: instance.loader?.projectID,
        source: instance.loader?.source
      };

      dispatch(
        addToQueue(
          instanceName,
          loader,
          null,
          `background${path.extname(imageURL)}`
        )
      );
    }
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
            content: `Synchronizing mods. ${queueLength} left.`,
            duration: 0
          })
        );
      }
    });

    Queue.on('executed', queueLength => {
      if (queueLength > 1) {
        dispatch(
          updateMessage({
            content: `Synchronizing mods. ${queueLength} left.`,
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
            const data = await getAddonsByFingerprint([murmurHash]);
            const exactMatch = (data.exactMatches || [])[0];
            const notMatch = (data.unmatchedFingerprints || [])[0];
            let mod = {};

            if (exactMatch) {
              let addon = null;
              try {
                addon = await getAddon(exactMatch.file.modId);
                mod = normalizeModData(
                  exactMatch.file,
                  exactMatch.file.modId,
                  addon.name
                );
                mod.fileName = path.basename(fileName);
              } catch {
                mod = {
                  fileName: path.basename(fileName),
                  displayName: path.basename(fileName),
                  packageFingerprint: murmurHash
                };
              }
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
        const modData = (instances[oldInstanceName].mods || []).find(
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

            if (!config.loader) {
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
            if (!config.loader) {
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

export function getJavaVersionForMCVersion(mcVersion) {
  return (_, getState) => {
    const { app } = getState();
    const { versions } = app?.vanillaManifest || {};
    if (versions) {
      const version = versions.find(v => v.id === mcVersion);
      const javaLatestInitialDate = new Date('2021-05-27T09:39:21+00:00');
      if (new Date(version?.releaseTime) < javaLatestInitialDate) {
        return 8;
      }
    }
    return LATEST_JAVA_VERSION;
  };
}

export function launchInstance(instanceName, forceQuit = false) {
  return async (dispatch, getState) => {
    const state = getState();

    const { userData } = state;
    const account = _getCurrentAccount(state);
    const librariesPath = _getLibrariesPath(state);
    const assetsPath = _getAssetsPath(state);
    const { memory, args } = state.settings.java;
    const { resolution: globalMinecraftResolution } =
      state.settings.minecraftSettings;
    const instanceState = _getInstance(state)(instanceName);
    const {
      loader,
      javaArgs,
      javaMemory,
      customJavaPath,
      resolution: instanceResolution
    } = instanceState;

    const mcJsonPath = path.join(
      _getMinecraftVersionsPath(state),
      `${loader?.mcVersion}.json`
    );

    let discordRPCDetails = `Minecraft ${loader?.mcVersion}`;

    if (loader.source && loader.sourceName) {
      discordRPCDetails = `${loader.sourceName}`;
    }

    ipcRenderer.invoke('update-discord-rpc', discordRPCDetails);

    const defaultJavaPathVersion = _getJavaPath(state)(
      dispatch(getJavaVersionForMCVersion(loader?.mcVersion))
    );
    const javaPath = customJavaPath || defaultJavaPathVersion;
    let missingResource = false;

    const verifyResource = async resourcePath => {
      if (forceQuit) return true;
      try {
        await fs.access(resourcePath);
        return true;
      } catch {
        console.warn(`Missing resource: ${resourcePath}`);
        dispatch(
          addToQueue(
            instanceName,
            instanceState.loader,
            null,
            instanceState.background
          )
        );

        await new Promise(resolve => {
          const unsubscribe = window.__store.subscribe(() => {
            if (!getState().downloadQueue[instanceName]) {
              unsubscribe();
              return resolve();
            }
          });
        });

        dispatch(launchInstance(instanceName));
        return false;
      }
    };

    const instancePath = path.join(_getInstancesPath(state), instanceName);

    const configPath = path.join(instancePath, 'config.json');
    const backupConfigPath = path.join(instancePath, 'config.bak.json');
    await fs.copyFile(configPath, backupConfigPath);

    const instanceJLFPath = path.join(
      _getInstancesPath(state),
      instanceName,
      'mods',
      '__JLF__.jar'
    );

    let errorLogs = '';

    // Verify main jar JSON
    let verified = await verifyResource(mcJsonPath);
    if (!verified) return;

    const mcJson = await fse.readJson(mcJsonPath);

    if (mcJson.logging) {
      // Verify logging xml
      const { sha1: loggingHash, id: loggingId } = mcJson.logging.client.file;
      if (loggingHash && loggingId) {
        const loggingPath = path.join(
          _getAssetsPath(state),
          'objects',
          loggingHash.substring(0, 2),
          loggingId
        );
        verified = await verifyResource(loggingPath);
        if (!verified) return;
      }
    }

    // Verify assets
    const assetsFile = path.join(
      _getAssetsPath(state),
      'indexes',
      `${mcJson.assets}.json`
    );
    verified = await verifyResource(assetsFile);
    if (!verified) return;
    await fse.readJson(assetsFile);
    const assetsJson = await fse.readJson(assetsFile);

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

    let libraries = [];
    let mcMainFile = {
      url: mcJson.downloads.client.url,
      sha1: mcJson.downloads.client.sha1,
      path: path.join(_getMinecraftVersionsPath(state), `${mcJson.id}.jar`)
    };
    verified = await verifyResource(mcMainFile.path);
    if (!verified) return;

    if (loader && loader?.loaderType === 'fabric') {
      const fabricJsonPath = path.join(
        _getLibrariesPath(state),
        'net',
        'fabricmc',
        loader?.mcVersion,
        loader?.loaderVersion,
        'fabric.json'
      );

      verified = await verifyResource(fabricJsonPath);
      if (!verified) return;

      const fabricJson = await fse.readJson(fabricJsonPath);
      const fabricLibraries = librariesMapper(
        fabricJson.libraries,
        librariesPath
      );
      libraries = libraries.concat(fabricLibraries);
      // Replace classname
      mcJson.mainClass = fabricJson.mainClass;
    } else if (loader && loader?.loaderType === 'forge') {
      const forgeJsonPath = path.join(
        _getLibrariesPath(state),
        'net',
        'minecraftforge',
        loader?.loaderVersion,
        `${loader?.loaderVersion}.json`
      );
      verified = await verifyResource(forgeJsonPath);
      if (!verified) return;

      if (gt(coerce(loader?.mcVersion), coerce('1.5.2'))) {
        const getForgeLastVer = ver =>
          Number.parseInt(ver.split('.')[ver.split('.').length - 1], 10);

        if (
          lt(coerce(loader?.loaderVersion.split('-')[1]), coerce('10.13.1')) &&
          gte(coerce(loader?.loaderVersion.split('-')[1]), coerce('9.11.1')) &&
          getForgeLastVer(loader?.loaderVersion) < 1217 &&
          getForgeLastVer(loader?.loaderVersion) > 935
        ) {
          const moveJavaLegacyFixerToInstance = async () => {
            await fs.lstat(path.join(_getDataStorePath(state), '__JLF__.jar'));
            await fse.copy(
              path.join(_getDataStorePath(state), '__JLF__.jar'),
              instanceJLFPath
            );
          };
          try {
            await moveJavaLegacyFixerToInstance();
          } catch {
            await dispatch(downloadJavaLegacyFixer(loader));
            await moveJavaLegacyFixerToInstance();
          }
        }
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
          // 1.17 check
          if (forgeJson.version.arguments.jvm) {
            mcJson.forge = { arguments: {} };
            mcJson.forge.arguments.jvm = forgeJson.version.arguments.jvm.map(
              arg => {
                return replaceLibraryDirectory(
                  arg
                    .replace(/\${version_name}/g, mcJson.id)
                    .replace(
                      /=\${library_directory}/g,
                      `="${_getLibrariesPath(state)}"`
                    ),
                  _getLibrariesPath(state)
                ).replace(
                  /\${classpath_separator}/g,
                  process.platform === 'win32' ? '";' : '":'
                );
              }
            );
          }
          mcJson.arguments.game = mcJson.arguments.game.concat(
            forgeJson.version.arguments.game
          );
        }
      } else {
        mcMainFile = {
          path: path.join(
            _getMinecraftVersionsPath(state),
            `${loader?.loaderVersion}.jar`
          )
        };
      }
    }
    libraries = removeDuplicates(
      libraries.concat(librariesMapper(mcJson.libraries, librariesPath)),
      'url'
    );

    for (const resource of [...libraries, ...assets]) {
      try {
        await fs.access(resource.path);
      } catch {
        console.warn(`Missing resource: ${resource.path}`);
        missingResource = true;
      }
    }

    if (missingResource) {
      dispatch(
        addToQueue(
          instanceName,
          instanceState.loader,
          null,
          instanceState.background
        )
      );

      await new Promise(resolve => {
        const unsubscribe = window.__store.subscribe(() => {
          if (!getState().downloadQueue[instanceName]) {
            unsubscribe();
            return resolve();
          }
        });
      });

      dispatch(launchInstance(instanceName, true));
      return;
    }
    ga.sendCustomEvent('launchedInstance');
    dispatch(openModal('InstanceStartupAd', { instanceName }));

    const getJvmArguments =
      mcJson.assets !== 'legacy' && gte(coerce(mcJson.assets), coerce('1.13'))
        ? getJVMArguments113
        : getJVMArguments112;

    const javaArguments = (javaArgs !== undefined ? javaArgs : args).split(' ');
    const javaMem = javaMemory !== undefined ? javaMemory : memory;
    const gameResolution = instanceResolution || globalMinecraftResolution;

    const jvmArguments = getJvmArguments(
      libraries,
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

    const { mcStartupMethod } = state.settings;
    let replaceWith = `..${path.sep}..`;

    const symLinkDirPath = path.join(userData.split('\\')[0], '_gdl');
    if (MC_STARTUP_METHODS[mcStartupMethod] === MC_STARTUP_METHODS.SYMLINK) {
      replaceWith = symLinkDirPath;
      if (process.platform === 'win32') await symlink(userData, symLinkDirPath);
    }

    const replaceRegex = [
      process.platform === 'win32'
        ? new RegExp(userData.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'g')
        : null,
      replaceWith
    ];

    const { sha1: loggingHash, id: loggingId } =
      mcJson?.logging?.client?.file || {};
    const loggingPath = path.join(
      assetsPath,
      'objects',
      loggingHash?.substring(0, 2) || '',
      loggingId || ''
    );

    const needsQuote = process.platform !== 'win32';

    console.log(
      `${addQuotes(needsQuote, javaPath)} ${getJvmArguments(
        libraries,
        mcMainFile,
        instancePath,
        assetsPath,
        mcJson,
        account,
        javaMem,
        gameResolution,
        true,
        javaArguments
      ).join(' ')}`
        .replace(...replaceRegex)
        .replace(
          // eslint-disable-next-line no-template-curly-in-string
          '-Dlog4j.configurationFile=${path}',
          `-Dlog4j.configurationFile=${addQuotes(needsQuote, loggingPath)}`
        )
    );

    if (state.settings.hideWindowOnGameLaunch) {
      await ipcRenderer.invoke('hide-window');
    }

    let closed = false;

    const ps = spawn(
      `${addQuotes(needsQuote, javaPath)}`,
      jvmArguments.map(v =>
        v
          .toString()
          .replace(...replaceRegex)
          .replace(
            // eslint-disable-next-line no-template-curly-in-string
            '-Dlog4j.configurationFile=${path}',
            `-Dlog4j.configurationFile=${addQuotes(needsQuote, loggingPath)}`
          )
      ),
      {
        cwd: instancePath,
        shell: process.platform !== 'win32',
        detached: true
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
    dispatch(updateStartedInstance({ instanceName, pid: ps.pid }));

    ps.stdout.on('data', data => {
      console.log(data.toString());
      if (
        data.toString().includes('Setting user:') ||
        data.toString().includes('Initializing LWJGL OpenAL')
      ) {
        if (
          !closed &&
          getState().modals.find(v => v.modalType === 'InstanceStartupAd')
        ) {
          closed = true;
          dispatch(closeModal());
        }
        dispatch(updateStartedInstance({ instanceName, initialized: true }));
      }
    });

    ps.stderr.on('data', data => {
      console.error(`ps stderr: ${data}`);
      errorLogs += data || '';

      if (
        data.toString().includes('Setting user:') ||
        data.toString().includes('Initializing LWJGL OpenAL')
      ) {
        if (
          !closed &&
          getState().modals.find(v => v.modalType === 'InstanceStartupAd')
        ) {
          closed = true;
          dispatch(closeModal());
        }
        dispatch(updateStartedInstance({ instanceName, initialized: true }));
      }
    });

    ps.on('close', async code => {
      clearInterval(playTimer);
      if (!ps.killed) {
        ps.kill('SIGKILL');
      }
      ipcRenderer.invoke('reset-discord-rpc');
      await new Promise(resolve => setTimeout(resolve, 200));
      ipcRenderer.invoke('show-window');
      dispatch(removeStartedInstance(instanceName));
      await fse.remove(instanceJLFPath);
      await fs.unlink(backupConfigPath);

      if (
        process.platform === 'win32' &&
        MC_STARTUP_METHODS[mcStartupMethod] === MC_STARTUP_METHODS.SYMLINK
      ) {
        fse.remove(symLinkDirPath);
      }

      if (
        !closed &&
        getState().modals.find(v => v.modalType === 'InstanceStartupAd')
      ) {
        dispatch(closeModal());
      }

      if (code !== 0 && errorLogs) {
        setTimeout(() => {
          dispatch(
            openModal('InstanceCrashed', {
              code,
              errorLogs: errorLogs?.toString('utf8')
            })
          );
        }, 225);
        console.warn(`Process exited with code ${code}. Not too good..`);
      }
    });
  };
}

export function installMod(
  projectID,
  fileID,
  instanceName,
  gameVersions,
  installDeps = true,
  onProgress,
  useTempMiddleware,
  item
) {
  return async (dispatch, getState) => {
    const state = getState();
    const instancesPath = _getInstancesPath(state);
    const instancePath = path.join(instancesPath, instanceName);
    const instance = _getInstance(state)(instanceName);
    const mainModData = await getAddonFile(projectID, fileID);
    const addon = await getAddon(projectID);
    mainModData.projectID = projectID;
    const destFile = path.join(instancePath, 'mods', mainModData.fileName);
    const tempFile = path.join(_getTempPath(state), mainModData.fileName);
    const installedMods = [];

    const removeModFromConfig = async () => {
      await Promise.all(
        installedMods.map(async mod => {
          if (mod.needToAddMod) {
            await dispatch(
              updateInstanceConfig(instanceName, prev => {
                return {
                  ...prev,
                  mods: [...prev.mods.filter(m => m.modId !== mod.addon.id)]
                };
              })
            );
          }
        })
      );
    };

    const urlDownloadPage = `https://www.curseforge.com/minecraft/mc-mods/${item.slug}/download/${mainModData.id}`;
    try {
      if (useTempMiddleware) {
        if (!mainModData.downloadUrl) {
          try {
            await browserDownload(urlDownloadPage, destFile);
          } catch (e) {
            await removeModFromConfig();
            dispatch(
              openModal('InfoModal', {
                modName: mainModData.name,
                preventClose: false,
                error: e
              })
            );
          }
        } else {
          await downloadFile(tempFile, mainModData.downloadUrl, onProgress);
        }
      }
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
                ? [normalizeModData(mainModData, projectID, addon.name)]
                : [])
            ]
          };
        })
      );
      installedMods.push({ addon, projectID, needToAddMod });

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
          if (murmur2 !== mainModData.fileFingerprint) {
            if (!mainModData.downloadUrl) {
              try {
                await browserDownload(urlDownloadPage, destFile);
              } catch (e) {
                await removeModFromConfig();
                dispatch(
                  openModal('InfoModal', {
                    modName: mainModData.name,
                    preventClose: false,
                    error: e
                  })
                );
              }
            } else {
              await downloadFile(destFile, mainModData.downloadUrl, onProgress);
            }
          }
        } catch {
          if (!mainModData.downloadUrl) {
            try {
              await browserDownload(urlDownloadPage, destFile);
            } catch (e) {
              await removeModFromConfig();
              dispatch(
                openModal('InfoModal', {
                  modName: mainModData.name,
                  preventClose: false,
                  error: e
                })
              );
            }
          } else {
            await downloadFile(destFile, mainModData.downloadUrl, onProgress);
          }
        }
      } else {
        await fse.move(tempFile, destFile, { overwrite: true });
      }

      if (installDeps) {
        await pMap(
          mainModData.dependencies,
          async dep => {
            // type 1: embedded
            // type 2: optional
            // type 3: required
            // type 4: tool
            // type 5: incompatible
            // type 6: include

            if (dep.relationType === 3) {
              if (instance.mods.some(x => x.addonId === dep.modId)) return;
              const depList = await getAddonFiles(dep.modId);
              const depData = depList.find(v =>
                v.gameVersions.includes(gameVersions)
              );

              await dispatch(
                installMod(
                  dep.modId,
                  depData.id,
                  instanceName,
                  gameVersions,
                  installDeps,
                  onProgress,
                  useTempMiddleware,
                  item
                )
              );
            }
          },
          { concurrency: 2 }
        );
      }
      return destFile;
    } catch (e) {
      await removeModFromConfig();
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
  gameVersions,
  onProgress
) => {
  return async dispatch => {
    const addon = await getAddon(mod.modId);
    const item = { ...mod, slug: addon.slug };
    await dispatch(
      installMod(
        mod.projectID,
        fileID,
        instanceName,
        gameVersions,
        false,
        onProgress,
        true,
        item
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
        let data = null;
        try {
          data = await getAddonFiles(mod);
        } catch {
          // nothing
        }
        return { projectID: mod, data };
      },
      { concurrency: 40 }
    );
    const manifestsObj = {};
    manifests
      .filter(v => v.data)
      .map(v => {
        // Find latest version for each mod
        const [latestMod] =
          getPatchedInstanceType(instance) === FORGE || v.projectID === 361988
            ? filterForgeFilesByVersion(v.data, instance.loader?.mcVersion)
            : filterFabricFilesByVersion(v.data, instance.loader?.mcVersion);
        if (latestMod) {
          manifestsObj[v.projectID] = latestMod;
        }
        return null;
      });

    dispatch(updateLatestModManifests(manifestsObj));
  };
};

export const isNewVersionAvailable = async () => {
  const { data: latestReleases } = await axios.get(
    'https://api.github.com/repos/gorilla-devs/GDLauncher/releases?per_page=10'
  );

  const latestPrerelease = latestReleases.find(v => v.prerelease);
  const latestStablerelease = latestReleases.find(v => !v.prerelease);

  const appData = await ipcRenderer.invoke('getAppdataPath');

  let releaseChannel = 0;

  try {
    const rChannel = await fs.readFile(
      path.join(appData, 'gdlauncher_next', 'rChannel')
    );
    releaseChannel = parseInt(rChannel.toString(), 10);
  } catch {
    // swallow error
  }

  const v = await ipcRenderer.invoke('getAppVersion');

  const isAppUpdated = r => gte(v, r.tag_name);
  if (
    releaseChannel === 0 &&
    (prerelease(v) || !isAppUpdated(latestStablerelease))
  ) {
    return latestStablerelease;
  }
  if (releaseChannel !== 0) {
    if (
      !isAppUpdated(latestStablerelease) &&
      (major(latestStablerelease.tag_name) > major(v) ||
        minor(latestStablerelease.tag_name) > minor(v) ||
        patch(latestStablerelease.tag_name) > patch(v))
    ) {
      return latestStablerelease;
    }
    if (latestPrerelease && !isAppUpdated(latestPrerelease)) {
      return latestPrerelease;
    }
  }

  return false;
};

export const checkForPortableUpdates = () => {
  return async (dispatch, getState) => {
    const state = getState();
    const baseFolder = await ipcRenderer.invoke('getExecutablePath');

    const tempFolder = path.join(_getTempPath(state), `update`);

    const newVersion = await isNewVersionAvailable();

    // Latest version has a value only if the user is not using the latest
    if (newVersion) {
      const baseAssetUrl = `https://github.com/gorilla-devs/GDLauncher/releases/download/${newVersion?.tag_name}`;
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
    return newVersion;
  };
};
