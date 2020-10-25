import axios from 'axios';
import path from 'path';
import { v5 as uuid } from 'uuid';
import { machineId } from 'node-machine-id';
import fse from 'fs-extra';
import coerce from 'semver/functions/coerce';
import gte from 'semver/functions/gte';
import lt from 'semver/functions/lt';
import gt from 'semver/functions/gt';
import log from 'electron-log';
import omitBy from 'lodash/omitBy';
import { pipeline } from 'stream';
import zlib from 'zlib';
import omit from 'lodash/omit';
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
  GDL_LEGACYJAVAFIXER_MOD_URL,
  FORGE
} from '../utils/constants';
import {
  mcAuthenticate,
  mcRefresh,
  mcInvalidate,
  getFabricManifest,
  getMcManifest,
  getForgeManifest,
  mcValidate,
  getJavaManifest,
  getAddonFiles,
  getAddonCategories
} from '../api';
import {
  _getCurrentAccount,
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
  getJVMArguments112,
  getJVMArguments113,
  getPlayerSkin,
  filterForgeFilesByVersion,
  filterFabricFilesByVersion,
  getPatchedInstanceType
} from '../../app/desktop/utils';
import { downloadFile } from '../utils/downloader';
import { removeDuplicates, sortByDate, reflect } from '../utils';
import { UPDATE_CONCURRENT_DOWNLOADS } from './settings/actionTypes';
import { UPDATE_MODAL } from './modals/actionTypes';
import { openModal } from './modals/actions';
import sendMessage, { handleMessage } from '../utils/sendMessage';
import EV from '../messageEvents';

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

    const homedir = await sendMessage(EV.GET_APP_DATA_PATH);
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

export function updateLastUpdateVersion(version) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_LAST_UPDATE_VERSION,
      version
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
      // Ensure that the new config is actually valid to write
      try {
        const JsonString = JSON.stringify(newConfig);
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

      try {
        await fs.lstat(configPath);

        await fse.outputJson(tempConfigPath, newConfig);
        await fse.rename(tempConfigPath, configPath);
      } catch {
        if (forceWrite) {
          await fse.outputJson(tempConfigPath, newConfig);
          await fse.rename(tempConfigPath, configPath);
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
      const fabricLibraries = await sendMessage(EV.MAP_LIBRARIES, {
        libraries: fabricJson.libraries,
        librariesPath
      });
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
        const forgeLibraries = await sendMessage(EV.MAP_LIBRARIES, {
          libraries: forgeJson.version.libraries,
          librariesPath
        });
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
      libraries.concat(
        await sendMessage(EV.MAP_LIBRARIES, {
          libraries: mcJson.libraries,
          librariesPath
        })
      ),
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
      await sendMessage(EV.HIDE_MAIN_WINDOW);
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
      await sendMessage(EV.SHOW_MAIN_WINDOW);
      dispatch(removeStartedInstance(instanceName));
      fse.remove(instanceJLFPath);
      if (process.platform === 'win32') fse.remove(symLinkDirPath);
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
        const data = (await getAddonFiles(mod)).data.sort(sortByDate);
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

    const appData = parse(await sendMessage(EV.GET_APP_DATA_PATH));
    let releaseChannel = 0;

    try {
      const rChannel = await fs.readFile(
        path.join(appData, 'gdlauncher_next', 'rChannel')
      );
      releaseChannel = rChannel.toString();
    } catch {
      // swallow error
    }

    const v = await sendMessage(EV.GET_APP_VERSION);

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
};

export const checkForPortableUpdates = () => {
  return async (dispatch, getState) => {
    const state = getState();
    const baseFolder = await sendMessage(EV.GET_EXECUTABLE_PATH);

    const tempFolder = path.join(_getTempPath(state), `update`);

    const latestVersion = await getAppLatestVersion();

    // Latest version has a value only if the user is not using the latest
    if (latestVersion) {
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

              const fileOnDiskSha1 = await sendMessage(
                EV.GET_FILE_HASH,
                fileOnDisk
              );

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

      const tempFiles = await sendMessage(EV.GET_FILES_RECURSIVE, tempFolder);
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
            const fileSha1 = await sendMessage(
              EV.GET_FILE_HASH,
              destinationPath
            );
            if (fileSha1.toString() !== file.sha1) {
              throw new Error('SHA1 mismatch', file.compressedFile);
            }
          } catch {
            try {
              try {
                await originalFs.promises.access(compressedFile);
                const fileSha1 = await sendMessage(
                  EV.GET_FILE_HASH,
                  compressedFile
                );
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

export const initInstances = () => {
  return async (dispatch, getState) => {
    const initialInstances = await sendMessage(EV.GET_INSTANCES);
    dispatch({
      type: ActionTypes.UPDATE_INSTANCES,
      instances: initialInstances
    });

    handleMessage(
      EV.UPDATE_MANAGE_MODAL_INSTANCE_RENAME,
      ([oldName, newName]) => {
        const state = getState();
        const instanceManagerModalIndex = state.modals.findIndex(
          x =>
            x.modalType === 'InstanceManager' &&
            x.modalProps.instanceName === oldName
        );
        dispatch({
          type: UPDATE_MODAL,
          modals: [
            ...state.modals.slice(0, instanceManagerModalIndex),
            {
              modalType: 'InstanceManager',
              modalProps: { instanceName: newName }
            },
            ...state.modals.slice(instanceManagerModalIndex + 1)
          ]
        });
      }
    );

    handleMessage(EV.UPDATE_INSTANCES, instances => {
      dispatch({
        type: ActionTypes.UPDATE_INSTANCES,
        instances
      });
    });

    handleMessage(EV.UPDATE_SPECIFIC_INSTANCE, instance => {
      dispatch({
        type: ActionTypes.UPDATE_SPECIFIC_INSTANCE,
        instance
      });
    });

    handleMessage(EV.REMOVE_SPECIFIC_INSTANCE, instanceName => {
      const state = getState();
      const instanceManagerModalIndex = state.modals.findIndex(
        x =>
          x.modalType === 'InstanceManager' &&
          x.modalProps.instanceName === instanceName
      );
      dispatch({
        type: UPDATE_MODAL,
        modals: [
          ...state.modals.slice(0, instanceManagerModalIndex),
          ...state.modals.slice(instanceManagerModalIndex + 1)
        ]
      });

      dispatch({
        type: ActionTypes.REMOVE_SPECIFIC_INSTANCE,
        instanceName
      });
    });

    handleMessage(EV.ADD_SPECIFIC_INSTANCE_QUEUE, instance => {
      dispatch({
        type: ActionTypes.ADD_SPECIFIC_INSTANCE_QUEUE,
        instance
      });
    });

    handleMessage(EV.REMOVE_SPECIFIC_INSTANCE_QUEUE, () => {
      dispatch({
        type: ActionTypes.REMOVE_SPECIFIC_INSTANCE_QUEUE
      });
    });

    handleMessage(EV.UPDATE_INSTALLATION_STATUS, data => {
      dispatch({
        type: ActionTypes.UPDATE_INSTALLATION_STATUS,
        data
      });
      dispatch({
        type: ActionTypes.UPDATE_INSTALLATION_PROGRESS,
        data: 0
      });
    });

    handleMessage(EV.UPDATE_INSTALLATION_PROGRESS, data => {
      dispatch({
        type: ActionTypes.UPDATE_INSTALLATION_PROGRESS,
        data: data && Number(data)
      });
    });

    handleMessage(EV.UPDATE_MOD_SYNC_STATE, value => {
      if (value > 1) {
        dispatch(
          updateMessage({
            content: `Syncronizing mods. ${value} left.`,
            duration: 0
          })
        );
      } else {
        dispatch(updateMessage(null));
      }
    });
  };
};
