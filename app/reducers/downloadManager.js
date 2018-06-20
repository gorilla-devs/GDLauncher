import update from 'immutability-helper';
import {
  START_DOWNLOAD,
  ADD_TO_QUEUE,
  DOWNLOAD_COMPLETED,
  DOWNLOAD_FILE_COMPLETED,
  UPDATE_TOTAL_FILES_TO_DOWNLOAD
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
            packType: action.packType,
            downloadCompleted: false,
            status: 'Queued'
          }
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
            downloaded: state.downloadQueue[action.payload.pack].downloaded + 1
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
