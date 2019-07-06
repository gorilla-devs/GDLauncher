import _ from 'lodash';
import {
  START_DOWNLOAD,
  ADD_TO_QUEUE,
  DOWNLOAD_COMPLETED,
  UPDATE_TOTAL_FILES_TO_DOWNLOAD,
  UPDATE_PROGRESS,
  CLEAR_QUEUE,
  ADD_NOT_READY_TO_QUEUE
} from '../actions/downloadManager';

const initialState = {
  downloadQueue: {}, // contains libs, assets and mainJar props
  actualDownload: null
};

export default function downloadManager(state = initialState, action) {
  switch (action.type) {
    case ADD_TO_QUEUE:
      return {
        ...state,
        downloadQueue: {
          ...state.downloadQueue,
          [action.payload]: {
            name: action.payload,
            totalToDownload: 0,
            downloaded: 0,
            percentage: 0,
            version: action.version,
            forgeVersion: action.forgeVersion,
            addonID: action.addonID,
            downloadCompleted: false,
            status: 'Queued'
          }
        }
      };
    case ADD_NOT_READY_TO_QUEUE:
      return {
        ...state,
        downloadQueue: {
          ...state.downloadQueue,
          [action.payload]: {
            name: action.payload,
            status: 'NotReady'
          }
        }
      };
    case CLEAR_QUEUE:
      return {
        ...state,
        downloadQueue: {
          ..._.omit(state.downloadQueue, action.payload)
        }
      };
    case START_DOWNLOAD:
      return {
        ...state,
        actualDownload: action.payload,
        downloadQueue: {
          ...state.downloadQueue,
          [action.payload]: {
            ...state.downloadQueue[action.payload],
            status: 'Downloading'
          }
        }
      };
    case DOWNLOAD_COMPLETED:
      return {
        ...state,
        actualDownload: null,
        downloadQueue: {
          ..._.omit(state.downloadQueue, action.payload)
        }
      };
    case UPDATE_PROGRESS:
      return {
        ...state,
        downloadQueue: {
          ...state.downloadQueue,
          [action.payload.pack]: {
            ...state.downloadQueue[action.payload.pack],
            percentage: action.payload.percentage
          }
        }
      };
    case UPDATE_TOTAL_FILES_TO_DOWNLOAD:
      return {
        ...state,
        downloadQueue: {
          ...state.downloadQueue,
          [action.payload.pack]: {
            ...state.downloadQueue[action.payload.pack],
            totalToDownload: action.payload.total
          }
        }
      };
    default:
      return state;
  }
}
