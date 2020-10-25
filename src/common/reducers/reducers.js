import omit from 'lodash/omit';
import * as ActionTypes from './actionTypes';

function news(state = [], action) {
  switch (action.type) {
    case ActionTypes.UPDATE_NEWS:
      return action.news;
    default:
      return state;
  }
}

function message(state = null, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_MESSAGE:
      return action.message;
    default:
      return state;
  }
}

function userData(state = null, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_USERDATA:
      return action.path;
    default:
      return state;
  }
}

function currentDownload(state = null, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_CURRENT_DOWNLOAD:
      return action.instanceName;
    default:
      return state;
  }
}

function instances(
  state = {
    started: false,
    list: {},
    installing: [],
    installationStatus: null,
    installationProgress: null
  },
  action
) {
  switch (action.type) {
    case ActionTypes.UPDATE_SPECIFIC_INSTANCE:
      return {
        ...state,
        list: { ...state.list, [action.instance.uid]: action.instance }
      };
    case ActionTypes.REMOVE_SPECIFIC_INSTANCE:
      return { ...state, list: omit(state.list, [action.uid]) };
    case ActionTypes.UPDATE_INSTANCES:
      return { ...state, list: action.instances };

    case ActionTypes.ADD_SPECIFIC_INSTANCE_QUEUE:
      return {
        ...state,
        installing: [...state.installing, { name: action.instance.name }]
      };
    case ActionTypes.REMOVE_SPECIFIC_INSTANCE_QUEUE:
      return {
        ...state,
        installing: state.installing.slice(1)
      };
    case ActionTypes.UPDATE_INSTALLATION_STATUS:
      return {
        ...state,
        installationStatus: action.data
      };
    case ActionTypes.UPDATE_INSTALLATION_PROGRESS:
      return {
        ...state,
        installationProgress: action.data
      };

    case ActionTypes.UPDATE_INSTANCES_STARTED:
      return { ...state, started: action.started };
    default:
      return state;
  }
}

function startedInstances(state = {}, action) {
  switch (action.type) {
    case ActionTypes.ADD_STARTED_INSTANCE:
      return {
        ...state,
        [action.instance.instanceName]: {
          pid: action.instance.pid,
          initialized: false
        }
      };
    case ActionTypes.UPDATE_STARTED_INSTANCE:
      return {
        ...state,
        [action.instance.instanceName]: {
          ...state[action.instance.instanceName],
          initialized: true
        }
      };
    case ActionTypes.REMOVE_STARTED_INSTANCE:
      return omit(state, [action.instanceName]);
    default:
      return state;
  }
}

function selectedInstance(state = null, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_SELECTED_INSTANCE:
      return action.instanceName;
    default:
      return state;
  }
}

function updateAvailable(state = false, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_UPDATE_AVAILABLE:
      return action.updateAvailable;
    default:
      return state;
  }
}

function latestModManifests(state = {}, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_MOD_MANIFESTS:
      return { ...state, ...action.manifests };
    case ActionTypes.CLEAR_MOD_MANIFESTS:
      return {};
    default:
      return state;
  }
}

export default {
  userData,
  news,
  message,
  currentDownload,
  instances,
  startedInstances,
  selectedInstance,
  updateAvailable,
  latestModManifests
};
