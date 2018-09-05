import {
  START_UPDATING,
  STOP_UPDATING,
  UPDATE_AVAILABLE,
} from '../actions/autoUpdater';

const initialState = {
  checkingForUpdates: false,
  updateAvailable: false,
  latestVersion: null
};

export default function instancesManager(state = initialState, action) {
  switch (action.type) {
    case `${START_UPDATING}`:
      return {
        ...state,
        checkingForUpdates: true
      };
    case `${STOP_UPDATING}`:
      return {
        ...state,
        checkingForUpdates: false
      };
    case `${UPDATE_AVAILABLE}`:
      return {
        ...state,
        updateAvailable: true,
        latestVersion: action.payload
      };
    default:
      return state;
  }
}
