import { message } from 'antd';
import log from 'electron-log';
import { spawn } from 'child_process';
import path from 'path';
import { promisify } from 'util';
import fs from 'fs';
import launchCommand from '../utils/MCLaunchCommand';
import { PACKS_PATH } from '../constants';

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

export function startInstance(instanceName) {
  return async (dispatch, getState) => {
    const { auth, settings } = getState();

    const config = JSON.parse(
      await promisify(fs.readFile)(
        path.join(PACKS_PATH, instanceName, 'config.json')
      )
    );

    const command = await launchCommand(
      instanceName,
      auth,
      (config.overrideArgs = ''
        ? settings.java.memory
        : settings.java.overrideMemory),
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
