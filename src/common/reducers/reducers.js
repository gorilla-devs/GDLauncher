import omit from "lodash.omit";
import * as ActionTypes from "./actionTypes";
import PromiseQueue from "../../app/desktop/utils/PromiseQueue";

function news(state = [], action) {
  switch (action.type) {
    case ActionTypes.UPDATE_NEWS:
      return action.news;
    default:
      return state;
  }
}

function javaDownloadStatus(state = null, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_JAVA_DOWNLOAD:
      return action.status;
    default:
      return state;
  }
}

function downloadQueue(state = {}, action) {
  switch (action.type) {
    case ActionTypes.ADD_DOWNLOAD_TO_QUEUE:
      return {
        ...state,
        [action.instanceName]: {
          percentage: 0,
          modloader: action.modloader,
          status: null,
          currentPhase: 1,
          totalPhases: action.phases,
          manifest: action.manifest
        }
      };
    case ActionTypes.REMOVE_DOWNLOAD_FROM_QUEUE:
      return omit(state, action.instanceName);
    case ActionTypes.UPDATE_DOWNLOAD_PROGRESS:
      return {
        ...state,
        [action.instanceName]: {
          ...state[action.instanceName],
          percentage: action.percentage
        }
      };
    case ActionTypes.UPDATE_DOWNLOAD_STATUS:
      return {
        ...state,
        [action.instanceName]: {
          ...state[action.instanceName],
          status: action.status
        }
      };
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

function instances(state = { started: false, list: {} }, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_INSTANCES:
      // eslint-disable-next-line
      for (const instance1 in action.instances) {
        const instance = action.instances[instance1];
        // eslint-disable-next-line
        if (!instance) continue;
        if (!instance.name) {
          // eslint-disable-next-line
          instance.name = instance1;
        }
        if (state.list[instance.name]?.queue) {
          // eslint-disable-next-line
          instance.queue = state.list[instance.name].queue;
        } else {
          // eslint-disable-next-line
          instance.queue = new PromiseQueue();
        }
      }
      return { ...state, list: action.instances };
    case ActionTypes.UPDATE_INSTANCES_STARTED:
      return { ...state, started: action.started };
    default:
      return state;
  }
}

function startedInstances(state = [], action) {
  switch (action.type) {
    case ActionTypes.ADD_STARTED_INSTANCE:
      return [...state, { instanceName: action.instanceName, pid: action.pid }];
    case ActionTypes.REMOVE_STARTED_INSTANCE:
      return state.filter(
        instance => instance.instanceName !== action.instanceName
      );
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

export default {
  news,
  downloadQueue,
  currentDownload,
  javaDownloadStatus,
  instances,
  startedInstances,
  selectedInstance,
  updateAvailable
};
