import { message } from 'antd';
import log from 'electron-log';
import { spawn } from 'child_process';
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
    const { auth, settings } = getState();
    const command = await launchCommand(instanceName, auth, settings.java.memory);
    const start = spawn(command, [], { shell: true });

    start.stdout.on("data", function (data) {
      console.log(data.toString());
    });

    start.stderr.on("data", function (data) {
      log.error(data.toString());
    });

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
