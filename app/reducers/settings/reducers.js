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

function general(state = {
  releaseChannel: 0, // 0 is stable, 1 is beta
  instancesPath: null,

}, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_GENERAL_SETTINGS:
      return { ...state, ...action.settings };
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