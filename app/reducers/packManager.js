import {
  GET_MC_VANILLA_VERSIONS,
  GET_MC_VANILLA_VERSION_DATA,
  RESET_MODAL_STATUS
} from '../actions/packManager';

const initialState = {
  fetchingVersions: false,
  versionsManifest: [],
  fetchingSelectedVersionData: false,
  fetchedSelectedVersionData: false
};

export default function vanilla(state = initialState, action) {
  switch (action.type) {
    case `${GET_MC_VANILLA_VERSIONS}_PENDING`:
      return {
        ...state,
        fetchingVersions: true
      };
    case `${GET_MC_VANILLA_VERSIONS}_FULFILLED`:
      return {
        ...state,
        versionsManifest: action.payload.data.versions,
        fetchingVersions: false,
      };
    case `${GET_MC_VANILLA_VERSIONS}_REJECTED`:
      return {
        ...state,
        fetchingVersions: false
      };
    // Specific version data
    case `${GET_MC_VANILLA_VERSION_DATA}_PENDING`:
      return {
        ...state,
        fetchingSelectedVersionData: true,
        fetchedSelectedVersionData: false
      };
    case `${GET_MC_VANILLA_VERSION_DATA}_FULFILLED`:
      return {
        ...state,
        fetchingSelectedVersionData: false,
        fetchedSelectedVersionData: true,
      };
    case `${GET_MC_VANILLA_VERSION_DATA}_REJECTED`:
      return {
        ...state,
        fetchingSelectedVersionData: false,
        fetchedSelectedVersionData: false
      };
    case `${RESET_MODAL_STATUS}`:
      return {
        ...state,
        fetchedSelectedVersionData: false
      };
    default:
      return state;
  }
}
