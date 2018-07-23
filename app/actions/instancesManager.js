import { message } from 'antd';
import launchCommand from '../utils/MCLaunchCommand';

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
  return (dispatch) => {
    dispatch({
      type: SELECT_INSTANCE,
      payload: name
    });
  };
}

export function startInstance(instanceName) {
  return async (dispatch, getState) => {
    const { auth } = getState();
    const util = require('util');
    const exec = util.promisify(require('child_process').exec);
    try {
      dispatch({
        type: START_INSTANCE,
        payload: instanceName
      });
      const name = await exec(await launchCommand(instanceName, auth));
    } catch (error) {
      message.error('There was an error while starting the instance');
      console.error(error);
    } finally {
      dispatch({
        type: STOP_INSTANCE,
        payload: instanceName
      });
    }
  };
}
