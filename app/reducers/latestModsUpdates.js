import {
  ADD_NEW_LATEST_MOD_UPDATE
} from '../actions/latestModsUpdates';

const initialState = [];

export default function latestModsUpdates(state = initialState, action) {
  switch (action.type) {
    case ADD_NEW_LATEST_MOD_UPDATE:
      return [
        ...state,
        action.newMod
      ];
    default:
      return state;
  }
}
