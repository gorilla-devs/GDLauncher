import {
  GET_MC_VANILLA_VERSIONS,
  CREATION_COMPLETE,
  RESET_MODAL_STATE
} from '../actions/packCreator';

const initialState = {
  versionsManifest: [],
  modalState: true
};

export default function packManager(state = initialState, action) {
  switch (action.type) {
    case `${GET_MC_VANILLA_VERSIONS}`:
      return {
        ...state,
        versionsManifest: action.payload.data.versions
      };
    case `${CREATION_COMPLETE}`:
      return {
        ...state,
        modalState: false
      };
    case `${RESET_MODAL_STATE}`:
      return {
        ...state,
        modalState: true
      };
    default:
      return state;
  }
}
