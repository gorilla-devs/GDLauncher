import * as ActionTypes from './actionTypes';

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
    return path;
  };
}

export function updateHideWindowOnGameLaunch(hideWindow) {
  return dispatch => {
    dispatch({
      type: ActionTypes.HIDE_WINDOW_ON_GAME_LAUNCH,
      hideWindow
    });
  };
}

export function updatePotatoPcMode(value) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_POTATO_PC_MODE,
      value
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

export function updateJavaMemory(memory, instanceName) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_JAVA_MEMORY,
      memory,
      instanceName
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

export function updateDiscordRPC(val) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_DISCORD_RPC,
      val
    });
  };
}
