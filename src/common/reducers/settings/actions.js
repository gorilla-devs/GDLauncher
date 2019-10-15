import * as ActionTypes from './actionTypes';

export function updateSoundsSetting(sounds) {
  return (dispatch, getState) => {
    dispatch({
      type: ActionTypes.UPDATE_SOUNDS,
      sounds
    })
  };
}

export function updateReleaseChannel(releaseChannel) {
  return (dispatch, getState) => {
    dispatch({
      type: ActionTypes.UPDATE_RELEASE_CHANNEL,
      releaseChannel
    })
  };
}

export function updateInstancesPath(path) {
  return (dispatch, getState) => {
    dispatch({
      type: ActionTypes.UPDATE_INSTANCES_PATH,
      path
    })
  };
}

export function updateShowChangelog(show) {
  return (dispatch, getState) => {
    dispatch({
      type: ActionTypes.UPDATE_INSTANCES_PATH,
      show
    })
  };
}

export function updateJavaPath(path) {
  return (dispatch, getState) => {
    dispatch({
      type: ActionTypes.UPDATE_JAVA_PATH,
      path
    })
  };
}

export function updateJavaMemory(memory) {
  return (dispatch, getState) => {
    dispatch({
      type: ActionTypes.UPDATE_JAVA_MEMORY,
      memory
    })
  };
}

export function updateJavaArguments(args) {
  return (dispatch) => {
    dispatch({
      type: ActionTypes.UPDATE_JAVA_ARGUMENTS,
      args
    })
  };
}