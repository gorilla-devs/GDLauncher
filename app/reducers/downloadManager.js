import _ from 'lodash';
import {
  START_DOWNLOAD,
  ADD_TO_QUEUE,
  DOWNLOAD_COMPLETED,
  DOWNLOAD_FILE_COMPLETED,
  UPDATE_TOTAL_FILES_TO_DOWNLOAD,
  UPDATE_PROGRESS,
  CLEAR_QUEUE
} from '../actions/downloadManager';

const initialState = {
  downloadQueue: {}, // contains libs, assets and mainJar props
  actualDownload: null,
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
            downloadCompleted: false,
            status: 'Queued'
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
          ...state.downloadQueue,
          [action.payload]: {
            ...state.downloadQueue[action.payload],
            downloadCompleted: true,
            status: 'Completed'
          }
        }
      };
    case DOWNLOAD_FILE_COMPLETED:
      return {
        ...state,
        downloadQueue: {
          ...state.downloadQueue,
          [action.payload.pack]: {
            ...state.downloadQueue[action.payload.pack],
            downloaded: state.downloadQueue[action.payload.pack].downloaded + 1,
            percentage: state.downloadQueue[action.payload.pack].totalToDownload === 0 ? 0 :
              (((state.downloadQueue[action.payload.pack].downloaded * 82) / state.downloadQueue[action.payload.pack].totalToDownload) + 18).toFixed(1)
          }
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
