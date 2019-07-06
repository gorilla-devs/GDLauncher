import { message } from 'antd';
import log from 'electron-log';
import { spawn } from 'child_process';
import { Promise } from 'bluebird';
import path, { join, basename } from 'path';
import { promisify } from 'util';
import makeDir from 'make-dir';
import _ from 'lodash';
import fss from 'fs';
import watch from 'node-watch';
import launchCommand from '../utils/MCLaunchCommand';
import { PACKS_PATH } from '../constants';
import { readConfig, updateConfig } from '../utils/instances';
import { setJavaArgs } from './settings';

const fs = Promise.promisifyAll(fss);

export const UPDATE_INSTANCES = 'UPDATE_INSTANCES';
export const SELECT_INSTANCE = 'SELECT_INSTANCE';
export const START_INSTANCE = 'START_INSTANCE';
export const STOP_INSTANCE = 'STOP_INSTANCE';

export function selectInstanceNullable(name) {
  return (dispatch, getState) => {
    const { instancesManager } = getState();
    if (instancesManager.selectedInstance === name) {
      dispatch({
        type: SELECT_INSTANCE,
        payload: null
      });
    } else {
      dispatch({
        type: SELECT_INSTANCE,
        payload: name
      });
    }
  };
}

export function selectInstance(name) {
  return dispatch => {
    dispatch({
      type: SELECT_INSTANCE,
      payload: name
    });
  };
}

export function initInstances() {
  return async (dispatch, getState) => {
    let watcher;
    const isDirectory = source => fss.lstatSync(source).isDirectory();

    const getDirectories = async source =>
      fs.readdirAsync(source)
        .map(name => join(source, name))
        .filter(isDirectory)
        .map(dir => basename(dir));

    const getInstances = async () => {
      let mappedInstances = [];
      try {
        const instances = await getDirectories(PACKS_PATH);
        mappedInstances = await Promise.all(instances.map(async instance => {
          let mods = [];
          try {
            const config = await readConfig(instance);
            if (config.mods && Array.isArray(config.mods) && config.mods.length) {
              try {
                mods = (await promisify(fss.readdir)(path.join(PACKS_PATH, instance, 'mods'))).filter(
                  el => path.extname(el) === '.zip' || path.extname(el) === '.jar'
                ).map(mod => {
                  const configMod = config.mods.find(v => v.filename === mod);
                  return {
                    name: mod,
                    projectID: configMod && configMod.projectID,
                    fileID: configMod && configMod.fileID
                  };
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
        await fs.accessAsync(PACKS_PATH);
      } catch (e) {
        await makeDir(PACKS_PATH);
      }
      let instances = await getInstances();
      dispatch({
        type: UPDATE_INSTANCES,
        instances
      });

      const updateInstances = async () => {
        instances = await getInstances();
        dispatch({
          type: UPDATE_INSTANCES,
          instances
        });
      };

      const getInstancesDebounced = _.debounce(updateInstances, 100);

      // Watches for any changes in the packs dir. TODO: Optimize
      watcher = watch(PACKS_PATH, { recursive: true }, async (event, filename) => {
        try {
          await fs.accessAsync(PACKS_PATH);
        } catch (e) {
          await makeDir(PACKS_PATH);
        }
        getInstancesDebounced();
      });
      watcher.on('error', async err => {
        try {
          await fs.accessAsync(PACKS_PATH);
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

export function startInstance(instanceName) {
  return async (dispatch, getState) => {
    const { auth, settings } = getState();

    // Checks for legacy java memory
    const legacyString = [' -Xmx{_RAM_}m', '-Xmx{_RAM_}m'];
    const config = await readConfig(instanceName);
    if (config.overrideArgs && (config.overrideArgs.includes(legacyString[0]) || config.overrideArgs.includes(legacyString[1]))) {
      await updateConfig(instanceName, {
        overrideArgs: config.overrideArgs.replace(legacyString, '')
      });
    }
    if (settings.java.javaArgs.includes(legacyString[0]) || settings.java.javaArgs.includes(legacyString[1]))
      dispatch(setJavaArgs(settings.java.javaArgs.replace(legacyString, '')));

    const command = await launchCommand(
      instanceName,
      auth,
      settings,
      settings.java.javaArgs
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
      type: START_INSTANCE,
      payload: instanceName,
      pid: start.pid
    });
    start.on('exit', async () => {
      clearInterval(timer);
      dispatch({
        type: STOP_INSTANCE,
        payload: instanceName
      });
      const config = JSON.parse(
        await promisify(fs.readFile)(
          path.join(PACKS_PATH, instanceName, 'config.json')
        )
      );
      await promisify(fs.writeFile)(
        path.join(PACKS_PATH, instanceName, 'config.json'),
        JSON.stringify({
          ...config,
          timePlayed:
            config.timePlayed && config.timePlayed !== null
              ? config.timePlayed + minutes
              : minutes
        })
      );
    });
    start.on('error', err => {
      message.error('There was an error while starting the instance');
      log.error(err);
    });
  };
}
