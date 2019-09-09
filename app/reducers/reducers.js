import { combineReducers } from 'redux';
import * as ActionTypes from './actionTypes';

function news(state = [], action) {
  switch (action.type) {
    case ActionTypes.UPDATE_NEWS:
      return {
        ...state,
        news: action.news
      };
    default:
      return state;
  }
}

function downloadQueue(state = {}, action) {
  switch (action.type) {
    case ActionTypes.ADD_DOWNLOAD_TO_QUEUE:
      return {
        ...state,
        [action.name]: {
          name: action.name,
          percentage: 0,
          version: action.version,
          forgeVersion: action.forgeVersion,
          addonID: action.addonID,
        }
      };
    case ActionTypes.REMOVE_DOWNLOAD_FROM_QUEUE:
      return _.omit(state, action.payload)
    case ActionTypes.UPDATE_DOWNLOAD_PROGRESS:
      return {
        ...state,
        [action.name]: {
          ...state[action.name],
          percentage: action.percentage
        }
      };
    default:
      return state;
  }
}

function currentDownload(state = null, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_CURRENT_DOWNLOAD:
      return action.name;
    default:
      return state;
  }
}

function instances(state = [], action) {
  switch (action.type) {
    case ActionTypes.UPDATE_INSTANCES:
      return action.instances;
    default:
      return state;
  }
}

function startedInstances(state = [], action) {
  switch (action.type) {
    case ActionTypes.ADD_STARTED_INSTANCE:
      return [...state, { name: action.name, pid: action.pid }];
    case ActionTypes.REMOVE_STARTED_INSTANCE:
      return state.filter(instance => instance.name !== action.name);
    default:
      return state;
  }
}

function selectedInstance(state = null, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_SELECTED_INSTANCE:
      return action.name;
    default:
      return state;
  }
}

export default {
  news,
  downloadQueue,
  currentDownload,
  instances,
  startedInstances,
  selectedInstance
};