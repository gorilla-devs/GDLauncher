import { MC_STARTUP_METHODS } from '../../utils/constants';
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

export function updateHideWindowOnGameLaunch(hideWindow) {
  return dispatch => {
    dispatch({
      type: ActionTypes.HIDE_WINDOW_ON_GAME_LAUNCH,
      hideWindow
    });
  };
}

export function updateShowNews(value) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_SHOW_NEWS,
      value
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

export function updateInstanceSortType(value) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_INSTANCE_SORT_METHOD,
      value
    });
  };
}

export function updateResolution(resolution) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_MINECRAFT_RESOLUTION,
      resolution
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
export function updateJavaLatestPath(path) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_JAVA_LATEST_PATH,
      path
    });
  };
}

export function updateMcStartupMethod(method) {
  return dispatch => {
    if (!MC_STARTUP_METHODS[method])
      throw new Error('Unknown mc startup method');

    dispatch({
      type: ActionTypes.UPDATE_MC_STARTUP_METHOD,
      method
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

export function updateDiscordRPC(val) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_DISCORD_RPC,
      val
    });
  };
}

export function updateCurseReleaseChannel(curseReleaseChannel) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_CURSE_RELEASE_CHANNEL,
      curseReleaseChannel
    });
  };
}
