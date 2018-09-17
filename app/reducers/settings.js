import {
  LOAD_SETTINGS,
  SET_SOUNDS
} from '../actions/settings';

const initialState = {
  sounds: true,
};

export default function Settings(state = initialState, action) {
  switch (action.type) {
    case `${LOAD_SETTINGS}`:
      return {
        ...state,
        sounds: action.payload.sounds
      };
    case `${SET_SOUNDS}`:
      return {
        ...state,
        sounds: action.payload
      };
    default:
      return state;
  }
}
