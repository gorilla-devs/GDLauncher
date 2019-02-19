import {
  GET_MC_VANILLA_VERSIONS,
  CREATION_COMPLETE,
  START_PACK_CREATION,
  GET_FORGE_MANIFEST
} from '../actions/packCreator';

const initialState = {
  versionsManifest: [],
  forgeManifest: {},
  loading: false
};

export default function packManager(state = initialState, action) {
  switch (action.type) {
    case `${GET_MC_VANILLA_VERSIONS}`:
      return {
        ...state,
        versionsManifest: action.payload.versions
      };
    case `${GET_FORGE_MANIFEST}`:
      return {
        ...state,
        forgeManifest: action.payload
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
