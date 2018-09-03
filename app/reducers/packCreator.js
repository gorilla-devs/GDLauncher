import {
  GET_MC_VANILLA_VERSIONS,
  CREATION_COMPLETE,
  START_PACK_CREATION
} from '../actions/packCreator';

const initialState = {
  versionsManifest: [],
  loading: false
};

export default function packManager(state = initialState, action) {
  switch (action.type) {
    case `${GET_MC_VANILLA_VERSIONS}`:
      return {
        ...state,
        versionsManifest: action.payload.data.versions
      };
    case `${START_PACK_CREATION}`:
      return {
        ...state,
        loading: true
      };
    case `${CREATION_COMPLETE}`:
      return {
        ...state,
        loading: false
      };
    default:
      return state;
  }
}
