import * as ActionTypes from "./actionTypes";

export function updateSoundsSetting(sounds) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_SOUNDS,
      sounds
    });
  };
}

export function updateReleaseChannel(releaseChannel) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_RELEASE_CHANNEL,
      releaseChannel
    });
  };
}

export function updateDataPath(path) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_DATA_PATH,
      path
    });
  };
}

export function updateInstancesPath(path) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_INSTANCES_PATH,
      path
    });
  };
}

export function updateShowChangelog(show) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_SHOW_CHANGELOG,
      show
    });
  };
}

export function updateJavaPath(path) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_JAVA_PATH,
      path
    });
  };
}

export function updateJavaMemory(memory) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_JAVA_MEMORY,
      memory
    });
  };
}

export function updateJavaArguments(args) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_JAVA_ARGUMENTS,
      args
    });
  };
}
