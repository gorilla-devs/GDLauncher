import { combineReducers } from "redux";
import { remote } from "electron";
import path from "path";
import isElectron from "is-electron";
import * as ActionTypes from "./actionTypes";

function sounds(state = true, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_SOUNDS:
      return action.sounds;
    default:
      return state;
  }
}

const defaultPath = isElectron() ? remote.app.getPath("userData") : null;

function dataPath(state = defaultPath, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_DATA_PATH:
      return action.path;
    default:
      return state;
  }
}

// 0 is stable, 1 is beta
function releaseChannel(state = 0, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_RELEASE_CHANNEL:
      return action.releaseChannel;
    default:
      return state;
  }
}

// 0 is stable, 1 is beta
function concurrentDownloads(state = 3, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_CONCURRENT_DOWNLOADS:
      return action.concurrentDownloads;
    default:
      return state;
  }
}

function java(
  state = {
    path: null,
    memory: 1,
    args: "DEFAULT_JAVA_ARGUMENTS"
  },
  action
) {
  switch (action.type) {
    case ActionTypes.UPDATE_JAVA_ARGUMENTS:
      return { ...state, args: action.args };
    case ActionTypes.UPDATE_JAVA_MEMORY:
      return { ...state, memory: action.memory };
    case ActionTypes.UPDATE_JAVA_PATH:
      return { ...state, path: action.path };
    default:
      return state;
  }
}

export default combineReducers({
  sounds,
  dataPath,
  releaseChannel,
  concurrentDownloads,
  java
});
