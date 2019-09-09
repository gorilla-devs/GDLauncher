import { combineReducers } from 'redux';
import * as ActionTypes from './actionTypes';
import { DEFAULT_JAVA_ARGUMENTS, DEFAULT_JAVA_MEMORY } from '../../constants';

function sounds(state = true, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_SOUNDS:
      return action.sounds;
    default:
      return state;
  }
}

function instancesPath(state = null, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_INSTANCES_PATH:
      return { ...state, ...action.settings };
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

function java(state = {
  path: null,
  memory: DEFAULT_JAVA_MEMORY,
  args: DEFAULT_JAVA_ARGUMENTS
}, action) {
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
  instancesPath,
  releaseChannel,
  java
});