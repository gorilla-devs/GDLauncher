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
import log from 'electron-log';
import omitBy from 'lodash/omitBy';
import { pipeline } from 'stream';
import zlib from 'zlib';
import lockfile from 'lockfile';
import omit from 'lodash/omit';
import Seven, { extractFull } from 'node-7z';
import { push } from 'connected-react-router';
import { spawn } from 'child_process';
import symlink from 'symlink-dir';
import fss, { promises as fs } from 'fs';
import originalFs from 'original-fs';
import pMap from 'p-map';
import makeDir from 'make-dir';
import { parse } from 'semver';
import { generate as generateRandomString } from 'randomstring';
import fxp from 'fast-xml-parser';
import * as ActionTypes from './actionTypes';
import {
  NEWS_URL,
  MC_RESOURCES_URL,
  GDL_LEGACYJAVAFIXER_MOD_URL,
  FORGE,
  FMLLIBS_OUR_BASE_URL,
  FMLLIBS_FORGE_BASE_URL,
  MICROSOFT_OAUTH_CLIENT_ID,
  MICROSOFT_OAUTH_REDIRECT_URL,
  ACCOUNT_MICROSOFT,
  ACCOUNT_MOJANG,
  FTB,
  FABRIC,
  CURSEFORGE,
  VANILLA
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
  // getFTBModpackData,
  getFTBModpackVersionData,
  getAddonCategories,
  msAuthenticateXBL,
  msExchangeCodeForAccessToken,
  msAuthenticateXSTS,
  msAuthenticateMinecraft,
  msMinecraftProfile,
  msOAuthRefresh
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
  _getDataStorePath,
  _getDownloadQueue
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
  importAddonZip,
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
import forgePatcher from '../utils/forgePatcher';

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
        const { data: newsXml } = await axios.get(NEWS_URL);
        const newsArr =
          fxp.parse(newsXml)?.rss?.channel?.item?.map(newsEntry => ({
            title: newsEntry.title,
            description: newsEntry.description,
            image: `https://minecraft.net${newsEntry.imageURL}`,
            url: newsEntry.link,
            guid: newsEntry.guid
          })) || [];
        dispatch({
          type: ActionTypes.UPDATE_NEWS,
          news: newsArr.splice(0, 10)
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
        if (redirect) {
          dispatch(push('/home'));
        }
      } catch (err) {
        console.warn('Could not fetch skin');
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
            if (err) reject(err);

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
  settings = {}
) {
  return async (dispatch, getState) => {
    const state = getState();
    const { currentDownload } = state;
    const patchedSettings =
      typeof settings === 'object' && settings !== null ? settings : {};

    dispatch({
      type: ActionTypes.ADD_DOWNLOAD_TO_QUEUE,
      instanceName,
      loader,
      manifest,
      background,
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

      await fse.remove(path.join(_getTempPath(state), loader?.loaderVersion));

      // This is garbage, need to use a stream somehow to directly inject data from/to jar
      const extraction = extractFull(
        tempInstaller,
        path.join(_getTempPath(state), loader?.loaderVersion),
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
        `${path.join(_getTempPath(state), loader?.loaderVersion)}/*`,
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

    const { files } = manifest;
    const concurrency = state.settings.concurrentDownloads;

    let modManifests = [];

    const updatePercentage = downloaded => {
      dispatch(updateDownloadProgress((downloaded * 100) / files.length));
    };

    let mappedFiles = files.map(async item => {
      return {
        ...item,
        path: path.join(instancePath, item.path, item.name)
      };
    });

    dispatch(updateDownloadStatus(instanceName, 'Downloading FTB files...'));
    await downloadInstanceFiles(mappedFiles, updatePercentage);

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

    const { data } = await getAddonsByFingerprint(
      Object.values(mappedFiles).map(v => v.murmur2)
    );
    const { exactMatches } = data || {};

    for (const item of exactMatches) {
      fileHashes[item.file.packageFingerprint] = item;
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
              const { projectId } = exactMatch.file;
              try {
                const { data: addon } = await getAddon(projectId);
                const mod = normalizeModData(
                  exactMatch.file,
                  projectId,
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
              addon?.categorySection?.path || 'mods',
              modManifest.fileName
            );
            const fileExists = await fse.pathExists(destFile);
            if (!fileExists) {
              await downloadFile(destFile, modManifest.downloadUrl);
            }
            modManifests = modManifests.concat(
              normalizeModData(modManifest, item.projectID, addon.name)
            );
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

    const { loader, manifest } = _getCurrentDownloadItem(state);

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
  };
}

export const changeModpackVersion = (instanceName, newModpackData) => {
  return async (dispatch, getState) => {
    const state = getState();
    const instance = _getInstance(state)(instanceName);
    const tempPath = _getTempPath(state);
    const instancePath = path.join(_getInstancesPath(state), instanceName);

    if (instance.loader.source === CURSEFORGE) {
      const { data: addon } = await getAddon(instance.loader?.projectID);

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

      const imageURL = addon?.attachments?.find(v => v.isDefault)?.thumbnailUrl;

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

      const loader = {
        loaderType: instance.loader?.loaderType,
        mcVersion: newManifest.minecraft.version,
        loaderVersion: convertcurseForgeToCanonical(
          newManifest.minecraft.modLoaders.find(v => v.primary).id,
          newManifest.minecraft.version,
          state.app.forgeManifest
        ),
        fileID: instance.loader?.fileID,
        projectID: instance.loader?.projectID,
        source: instance.loader?.source
      };

      dispatch(
        addToQueue(
          instanceName,
          loader,
          newManifest,
          `background${path.extname(imageURL)}`
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
              let addon = null;
              try {
                addon = (await getAddon(exactMatch.file.projectId)).data;
                mod = normalizeModData(
                  exactMatch.file,
                  exactMatch.file.projectId,
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

export function launchInstance(instanceName) {
  return async (dispatch, getState) => {
    const { downloadInstanceZip, zipUrl } = _getInstance(getState())(
      instanceName
    );
    // We need to download the .zip file again and parse it
    if (zipUrl && downloadInstanceZip) {
      let state = getState();
      const { loader, mods } = _getInstance(state)(instanceName);
      const tempPath = _getTempPath(state);
      const instancesPath = _getInstancesPath(state);
      const { forgeManifest } = state.app;
      const addonPathZip = path.join(_getTempPath(state), instanceName);
      let zipDownloaded = true;

      try {
        await downloadFile(path.join(tempPath, path.basename(zipUrl)), zipUrl);
      } catch {
        zipDownloaded = false;
        log.log(`Impossible to download ${zipUrl}.`);
      }

      if (zipDownloaded) {
        const manifest = await importAddonZip(
          path.join(tempPath, path.basename(zipUrl)),
          path.join(instancesPath, instanceName),
          path.join(tempPath, instanceName),
          tempPath
        );
        fse.remove(addonPathZip);

        let newLoader = null;

        const isForge = (manifest?.minecraft?.modLoaders || []).find(
          v => v.id.includes(FORGE) && v.primary
        );

        const isFabric = (manifest?.minecraft?.modLoaders || []).find(
          v => v.id.includes(FABRIC) && v.primary
        );

        const isVanilla = (manifest?.minecraft?.modLoaders || []).find(
          v => v.id.includes(VANILLA) && v.primary
        );

        if (isForge) {
          newLoader = {
            ...loader,
            loaderType: FORGE,
            mcVersion: manifest.minecraft.version,
            loaderVersion: convertcurseForgeToCanonical(
              manifest.minecraft.modLoaders.find(v => v.primary).id,
              manifest.minecraft.version,
              forgeManifest
            )
          };
        } else if (isFabric) {
          newLoader = {
            ...loader,
            loaderType: FABRIC,
            mcVersion: manifest.minecraft.version,
            loaderVersion: manifest.minecraft.modLoaders[0].yarn,
            fileID: manifest.minecraft.modLoaders[0].loader
          };
        } else if (isVanilla) {
          newLoader = {
            ...loader,
            loaderType: VANILLA,
            mcVersion: manifest.minecraft.version
          };
          delete newLoader.loaderVersion;
        }

        if (JSON.stringify(loader) !== JSON.stringify(newLoader)) {
          dispatch(addToQueue(instanceName, newLoader, manifest));

          // wait for the game to install
          do {
            await new Promise(resolve => setTimeout(resolve, 300));
            state = getState();
          } while (_getDownloadQueue(state)[instanceName] !== undefined);
        }

        if (manifest.files === [])
          mods.forEach(mod => dispatch(deleteMod(instanceName, mod)));

        let modsDone = 0;
        let modsModified = 0;
        const originalMods = [...mods];
        manifest.files.forEach(newMod => {
          const presentMod = originalMods.filter(
            mod => mod.projectID === newMod.projectID
          )[0];

          if (presentMod) {
            originalMods.splice(originalMods.indexOf(presentMod), 1);

            if (presentMod.fileID !== newMod.fileID) {
              modsModified += 1;
              dispatch(
                updateMod(
                  instanceName,
                  presentMod,
                  newMod.fileID,
                  newLoader.mcVersion,
                  p => {
                    if (p === '100.0') modsDone += 1;
                  }
                )
              );
            }
          } else {
            modsModified += 1;
            dispatch(
              installMod(
                newMod.projectID,
                newMod.fileID,
                instanceName,
                newLoader.mcVersion,
                false,
                p => {
                  if (p === '100.0') modsDone += 1;
                }
              )
            );
          }
        });

        originalMods.forEach(mod => dispatch(deleteMod(instanceName, mod)));

        do {
          await new Promise(resolve => setTimeout(resolve, 300));
          log.log('wait', modsDone, 'sur', modsModified);
        } while (modsDone < modsModified);
        log.log('done');
      }
    }

    const state = getState();
    const defaultJavaPath = _getJavaPath(state);

    const { userData } = state;
    const account = _getCurrentAccount(state);
    const librariesPath = _getLibrariesPath(state);
    const assetsPath = _getAssetsPath(state);
    const { memory, args } = state.settings.java;
    const {
      resolution: globalMinecraftResolution
    } = state.settings.minecraftSettings;

    const {
      loader,
      javaArgs,
      javaMemory,
      customJavaPath,
      resolution: instanceResolution
    } = _getInstance(state)(instanceName);

    const javaPath = customJavaPath || defaultJavaPath;

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

    const mcJson = await fse.readJson(
      path.join(_getMinecraftVersionsPath(state), `${loader?.mcVersion}.json`)
    );
    let libraries = [];
    let mcMainFile = {
      url: mcJson.downloads.client.url,
      sha1: mcJson.downloads.client.sha1,
      path: path.join(_getMinecraftVersionsPath(state), `${mcJson.id}.jar`)
    };

    if (loader && loader?.loaderType === 'fabric') {
      const fabricJsonPath = path.join(
        _getLibrariesPath(state),
        'net',
        'fabricmc',
        loader?.mcVersion,
        loader?.loaderVersion,
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
    } else if (loader && loader?.loaderType === 'forge') {
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
            await fse.move(
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

        const forgeJsonPath = path.join(
          _getLibrariesPath(state),
          'net',
          'minecraftforge',
          loader?.loaderVersion,
          `${loader?.loaderVersion}.json`
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
            `${loader?.loaderVersion}.jar`
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
      `"${javaPath}" ${getJvmArguments(
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

    dispatch(
      updateInstanceConfig(instanceName, prev => ({
        ...prev,
        lastPlayed: Date.now()
      }))
    );
    dispatch(addStartedInstance({ instanceName, pid: ps.pid }));

    ps.stdout.on('data', data => {
      console.log(data.toString());
      if (data.toString().includes('Setting user:')) {
        dispatch(updateStartedInstance({ instanceName, initialized: true }));
      }
    });

    ps.stderr.on('data', data => {
      console.error(`ps stderr: ${data}`);
      errorLogs += data || '';
    });

    ps.on('close', async code => {
      clearInterval(playTimer);
      if (!ps.killed) {
        ps.kill('SIGKILL');
      }
      await new Promise(resolve => setTimeout(resolve, 200));
      ipcRenderer.invoke('show-window');
      dispatch(removeStartedInstance(instanceName));
      await fse.remove(instanceJLFPath);
      if (process.platform === 'win32') fse.remove(symLinkDirPath);
      await fs.unlink(backupConfigPath);
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
    const instance = _getInstance(state)(instanceName);
    const mainModData = await getAddonFile(projectID, fileID);
    const { data: addon } = await getAddon(projectID);
    mainModData.data.projectID = projectID;
    const destFile = path.join(instancePath, 'mods', mainModData.data.fileName);
    const tempFile = path.join(_getTempPath(state), mainModData.data.fileName);

    if (useTempMiddleware) {
      await downloadFile(tempFile, mainModData.data.downloadUrl, onProgress);
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
              ? [normalizeModData(mainModData.data, projectID, addon.name)]
              : [])
          ]
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
            if (instance.mods.some(x => x.addonId === dep.addonId)) return;
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
    return destFile;
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

export const getAppLatestVersion = async () => {
  const { data: latestReleases } = await axios.get(
    'https://api.github.com/repos/gorilla-devs/GDLauncher/releases?per_page=10'
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

  const v = await ipcRenderer.invoke('getAppVersion');

  const installedVersion = parse(v);
  const isAppUpdated = r => !lt(installedVersion, parse(r.tag_name));

  // If we're on beta but the release channel is stable, return latest stable to force an update
  if (v.includes('beta') && releaseChannel === 0) {
    return latestStablerelease;
  }

  if (!isAppUpdated(latestStablerelease)) {
    return latestStablerelease;
  }
  if (!isAppUpdated(latestPrerelease) && releaseChannel !== 0) {
    return latestPrerelease;
  }

  return false;
};

export const checkForPortableUpdates = () => {
  return async (dispatch, getState) => {
    const state = getState();
    const baseFolder = await ipcRenderer.invoke('getExecutablePath');

    const tempFolder = path.join(_getTempPath(state), `update`);

    const latestVersion = await getAppLatestVersion();

    // Latest version has a value only if the user is not using the latest
    if (latestVersion) {
      const baseAssetUrl = `https://github.com/gorilla-devs/GDLauncher/releases/download/${latestVersion?.tag_name}`;
      const { data: latestManifest } = await axios.get(
        `${baseAssetUrl}/${process.platform}_latest.json`
      );
      console.log('inside', latestVersion);
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
