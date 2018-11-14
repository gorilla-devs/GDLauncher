import { message } from 'antd';
import log from 'electron-log';
import { exec } from 'child_process';
import path from 'path';
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
    const { auth } = getState();
    const start = exec(
      await launchCommand(instanceName, auth),
      { cwd: path.join(PACKS_PATH, instanceName) },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
      }
    );
    dispatch({
      type: START_INSTANCE,
      payload: instanceName,
      pid: start.pid
    });
    start.on('exit', () => {
      dispatch({
        type: STOP_INSTANCE,
        payload: instanceName
      });
    });
    start.on('error', err => {
      message.error('There was an error while starting the instance');
      log.error(err);
    });
  };
}
