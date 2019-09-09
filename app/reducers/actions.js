import { get } from 'lodash';
import { spawn } from 'child_process';
import fss, { promises as fs } from 'fs';
import { message } from 'antd';
import fse from 'fs-extra';
import path from 'path';
import watch from 'node-watch';
import makeDir from 'make-dir';
import { push } from 'connected-react-router';
import * as ActionTypes from './actionTypes';
import { minecraftLogin, minecraftCheckAccessToken, minecraftRefreshAccessToken } from '../APIs';
import { uuidv4 } from '../utils';
import { updateJavaArguments } from './settings/actions';
import launchCommand from '../utils/MCLaunchCommand';
import { PACKS_PATH } from '../constants';
import { readConfig, updateConfig } from '../utils/instances';
import { getCurrentAccount } from '../utils/selectors';

export function initManifests() {
  return async dispatch => {
    const versions = (await axios.get(GAME_VERSIONS_URL)).data;
    dispatch({
      type: UPDATE_VANILLA_MANIFEST,
      data: versions
    });
    const promos = (await axios.get(FORGE_PROMOS)).data;
    const forgeVersions = {};
    // Looping over vanilla versions, create a new entry in forge object
    // and add to it all correct versions
    versions.versions.forEach(v => {
      forgeVersions[v.id] = promos
        .filter(ver => {
          // Filter out all versions below 1.6.1 until we decide to support them
          if (versionCompare(v.id, '1.6.1') === -1) return false;
          return ver.gameVersion === v.id;
        })
        .map(ver => ver.name.replace('forge-', ''));
    });

    dispatch({
      type: UPDATE_FORGE_MANIFEST,
      data: _.omitBy(forgeVersions, v => v.length === 0)
    });
  };
}

export function initNews(news) {
  return async (dispatch, getState) => {
    const { news, loading: { loading_news } } = getState();
    if (news.length === 0 && !loading_news) {
      try {
        const res = await axios.get(NEWS_URL);
        const newsArr = await Promise.all(
          res.data.article_grid.map(async item => {
            return {
              title: item.default_tile.title,
              description: item.default_tile.sub_header,
              // We need to get the header image of every article, since
              // the ones present in this json are thumbnails
              image: await getArticleHeaderImage(item.article_url),
              url: `https://minecraft.net${item.article_url}`
            };
          })
        );
        dispatch({ type: UPDATE_NEWS, payload: newsArr.splice(0, 12) });
      } catch (err) {
        log.error(err.message);
      }
    }
  };
};

export function updateAccount(uuid, account) {
  return (dispatch, getState) => {
    dispatch({
      type: ActionTypes.UPDATE_ACCOUNT,
      id: uuid,
      account,
    });
  };
};

export function removeAccount(id) {
  return async (dispatch, getState) => {
    dispatch({
      type: ActionTypes.REMOVE_ACCOUNT,
      id
    });
  };
};

export function updateIsNewUser(isNewUser) {
  return async (dispatch, getState) => {
    dispatch({
      type: ActionTypes.UPDATE_IS_NEW_USER,
      isNewUser
    });
  };
}

export function updateCurrentAccountId(id) {
  return async (dispatch, getState) => {
    dispatch({
      type: ActionTypes.UPDATE_CURRENT_ACCOUNT_ID,
      id
    });
  };
}

export function login(username, password, remember) {
  return async (dispatch, getState) => {
    const { app: { clientToken, isNewUser } } = getState();
    try {
      const { data, status } = await minecraftLogin(username, password);
      if (status !== 200) throw new Error();
      dispatch(updateAccount(data.selectedProfile.id, data));
      dispatch(updateCurrentAccountId(data.selectedProfile.id));

      if (!isNewUser) {
        dispatch(push('/home'));
      } else {
        dispatch(updateIsNewUser(false));
        dispatch(push('/newUserPage'));
      }
    } catch {
      message.error('Wrong username or password');
      throw new Error();
    }
  };
}

export function loginWithAccessToken(accessToken) {
  return async (dispatch, getState) => {
    const state = getState();
    const { app: { clientToken } } = state;
    const accessToken = getCurrentAccount(state).accessToken;
    try {
      const { data, status } = await minecraftCheckAccessToken(accessToken, clientToken);
      dispatch(push('/home'));
    } catch (err) {
      // Trying refreshing the stored access token
      if (error.response && error.response.status === 403) {
        try {
          const { data, status } = await minecraftRefreshAccessToken(accessToken, clientToken);
          dispatch(updateAccount(data.selectedProfile.id, data));
          dispatch(updateCurrentAccountId(data.selectedProfile.id));
          dispatch(push('/home'));
        } catch {
          message.error('Token Not Valid. You Need To Log-In Again :(');
          dispatch(removeAccount(data.selectedProfile.id));
          throw new Error();
        }
      } else if (error.message === 'Network Error') {
        message.info('You are offline. Logging in in offline-mode');
        dispatch(push('/home'));
      }
    }
  };
}

export function loginThroughNativeLauncher() {
  return async (dispatch, getState) => {
    const { app: { clientToken, isNewUser } } = getState();

    const homedir = process.env.APPDATA || os.homedir();
    const vanillaMCPath = path.join(homedir, '.minecraft');
    const vnlJson = await fse.readJson(
      path.join(vanillaMCPath, 'launcher_profiles.json')
    );

    const { account } = vnlJson.selectedUser;
    const { accessToken } = vnlJson.authenticationDatabase[account];
    try {
      const { data, status } = await minecraftRefreshAccessToken(accessToken, clientToken);

      // We need to update the accessToken in launcher_profiles.json
      vnlJson.authenticationDatabase[
        newUserData.selectedProfile.userId
      ].accessToken = data.accessToken;
      await fsa.writeJson(
        path.join(vanillaMCPath, 'launcher_profiles.json'),
        vnlJson
      );

      dispatch(updateAccount(data.selectedProfile.id, data));
      dispatch(updateCurrentAccountId(data.selectedProfile.id));

      if (isNewUser) {
        dispatch(updateIsNewUser(false));
        dispatch(push('/newUserPage'));
      } else {
        dispatch(push('/home'));
      }
    } catch {
      message.error(
        'We could not log you in through Minecraft Launcher. Invalid data.'
      );
      throw new Error();
    }
  };
}

export function logout() {
  return (dispatch, getState) => {
    const state = getState();
    const id = getCurrentAccount(state).selectedProfile.id;
    dispatch(removeAccount(id));
    dispatch(push('/'));
  };
}

export function checkClientToken() {
  return (dispatch, getState) => {
    const { app: { clientToken } } = getState();
    if (clientToken) return clientToken;
    const newToken = uuidv4().replace('-', '');
    dispatch({
      type: ActionTypes.UPDATE_CLIENT_TOKEN,
      clientToken: newToken,
    });
    return newToken;
  };
};

export function updateModsManifests(modManifest) {
  return (dispatch, getState) => {
    const { app: { modsManifests } } = getState();
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
  return (dispatch, getState) => {
    dispatch({
      type: ActionTypes.REMOVE_MOD_MANIFEST,
      id,
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

export function startInstance(instanceName) {
  return async (dispatch, getState) => {
    const state = getState();
    const {
      app: { currentAccountIndex, accounts },
      settings: { java: { args } }
    } = state;

    // Checks for legacy java memory
    const legacyString = [' -Xmx{_RAM_}m', '-Xmx{_RAM_}m'];
    const config = await readConfig(instanceName);
    if (config.overrideArgs && (config.overrideArgs.includes(legacyString[0]) || config.overrideArgs.includes(legacyString[1]))) {
      await updateConfig(instanceName, {
        overrideArgs: config.overrideArgs.replace(legacyString, '')
      });
    }

    if (args.includes(legacyString[0]))
      dispatch(updateJavaArguments(args.replace(legacyString[0], '')));
    if (settings.java.javaArgs.includes(legacyString[1]))
      dispatch(updateJavaArguments(args.replace(legacyString[1], '')));

    const command = await launchCommand(
      instanceName,
      state
    );

    const start = spawn(command, [], {
      shell: true,
      cwd: path.join(PACKS_PATH, instanceName)
    });

    let minutes = 0;
    const timer = setInterval(() => {
      minutes += 1;
    }, 60000);

    start.stdout.on('data', data => {
      console.log(data.toString());
    });

    start.stderr.on('data', data => {
      log.error(data.toString());
    });

    dispatch({
      type: ActionTypes.ADD_STARTED_INSTANCE,
      name: instanceName,
      pid: start.pid
    });

    start.on('exit', async () => {
      clearInterval(timer);
      dispatch({
        type: ActionTypes.REMOVE_STARTED_INSTANCE,
        name: instanceName
      });
      const config = await readConfig(instanceName);
      await updateConfig(instanceName, {
        timePlayed: config.timePlayed ? config.timePlayed + minutes : minutes
      });
    });
    start.on('error', err => {
      message.error('There was an error while starting the instance');
      log.error(err);
    });
  };
}

export function initInstances() {
  return async (dispatch, getState) => {
    let watcher;
    const isDirectory = source => fss.lstatSync(source).isDirectory();

    const getDirectories = async source =>
      fs.readdir(source)
        .map(name => join(source, name))
        .filter(isDirectory)
        .map(dir => basename(dir));

    const getInstances = async () => {
      let mappedInstances = [];
      try {
        const instances = await getDirectories(PACKS_PATH);
        mappedInstances = await Promise.all(instances.map(async instance => {
          let mods = [];
          let projectID = null;
          try {
            const config = await readConfig(instance);
            projectID = config.projectID;
            if (config.mods && Array.isArray(config.mods) && config.mods.length) {
              try {
                mods = (await fs.readdir(path.join(PACKS_PATH, instance, 'mods'))).filter(
                  el => path.extname(el) === '.zip' || path.extname(el) === '.jar' || path.extname(el) === '.disabled'
                ).map(mod => {
                  const configMod = config.mods.find(v => v.fileName === mod);
                  if (configMod)
                    return configMod;
                  return { fileName: mod }
                });
              } catch (err) {
                console.error('Failed to get instance\'s mods', err)
              }
            }
          } catch (err) {
            console.error('Failed to get instance\'s config', err)
          }
          return {
            name: instance,
            ...(projectID && { projectID }),
            mods: mods
          }
        }));
      } catch (err) {
        console.error('Failed to get instances', err);
      }
      return mappedInstances;
    };

    const watchRoutine = async () => {
      try {
        await fs.access(PACKS_PATH);
      } catch (e) {
        await makeDir(PACKS_PATH);
      }
      let instances = await getInstances();
      dispatch({
        type: ActionTypes.UPDATE_INSTANCES,
        instances
      });

      const updateInstances = async () => {
        instances = await getInstances();
        const { instances: stateInstances } = getState();
        if (!isEqual(stateInstances, instances)) {
          dispatch({
            type: ActionTypes.UPDATE_INSTANCES,
            instances
          });
        }
      };

      const getInstancesDebounced = _.debounce(updateInstances, 100);

      // Watches for any changes in the packs dir. TODO: Optimize
      watcher = watch(PACKS_PATH, { recursive: true }, async (event, filename) => {
        try {
          await fs.access(PACKS_PATH);
        } catch (e) {
          await makeDir(PACKS_PATH);
        }
        getInstancesDebounced();
      });
      watcher.on('error', async err => {
        try {
          await fs.access(PACKS_PATH);
        } catch (e) {
          await makeDir(PACKS_PATH);
        }
        finally {
          watchRoutine();
        }
      });
    };

    watchRoutine();
  };
}

export function createInstance(version, packName, forgeVersion = null) {
  return async dispatch => {
    await makeDir(path.join(PACKS_PATH, packName));
    await dispatch(addToQueue(packName, version, forgeVersion));
  };
}

export function instanceDownloadOverride(
  version,
  packName,
  forgeVersion = null
) {
  return async dispatch => {
    try {
      await fs.access(path.join(PACKS_PATH, packName));
    } catch (e) {
      await makeDir(path.join(PACKS_PATH, packName));
    } finally {
      await dispatch(addToQueue(packName, version, forgeVersion));
    }
  };
}

function updateDownloadProgress(min, percDifference, computed, total) {
  return (dispatch, getState) => {
    const { downloadQueue } = getState();
    const actualDownload = Object.keys(downloadQueue).find(v => downloadQueue[v].status === "Downloading");
    const actualPercentage = (computed * percDifference) / total;
    dispatch({
      type: ActionTypes.UPDATE_DOWNLOAD_PROGRESS,
      name: downloadQueue[actualDownload].name,
      percentage: Number(actualPercentage.toFixed()) + Number(min)
    });
  }
}