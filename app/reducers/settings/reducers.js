import { combineReducers } from 'redux';
import * as ActionTypes from './actionTypes';
import { DEFAULT_ARGS, DEFAULT_JAVA_MEMORY } from '../../constants';

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
    case ActionTypes.UPDATE_GENERAL_SETTINGS:
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
  arguments: DEFAULT_JAVA_ARGUMENTS
}, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_JAVA_SETTINGS:
      return { ...state, ...action.settings };
    default:
      return state;
  }
}

export default combineReducers({
  sounds,
  general,
  java
});