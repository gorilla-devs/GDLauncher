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
    case ActionTypes.ADD_STARTING_INSTANCE:
      return {
        ...state,
        list: {
          ...state.list,
          [action.instance.uid]: {
            ...action.instance,
            initialized: false,
            initializing: true
          }
        }
      };
    case ActionTypes.ADD_STARTED_INSTANCE:
      return {
        ...state,
        list: {
          ...state.list,
          [action.instance.uid]: {
            ...action.instance,
            initialized: true,
            initializing: false
          }
        }
      };
    case ActionTypes.REMOVE_STARTED_INSTANCE:
      return {
        ...state,
        list: {
          ...state.list,
          [action.instance.uid]: {
            ...action.instance,
            initialized: false,
            initializing: false
          }
        }
      };

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

export default {
  news,
  message,
  instances,
  updateAvailable
};
