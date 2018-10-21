import {
  LOAD_SETTINGS,
  SET_SOUNDS,
  SET_THEME,
  RESET_THEME
} from '../actions/settings';

const initialState = {
  sounds: true,
  theme: {}
};

export default function Settings(state = initialState, action) {
  switch (action.type) {
    case `${LOAD_SETTINGS}`:
      return action.payload;
    case `${SET_SOUNDS}`:
      return {
        ...state,
        sounds: action.payload
      };
    case `${SET_THEME}`:
      return {
        ...state,
        theme: {
          ...state.theme,
          [action.payload.property]: action.payload.value
        }
      };
    case RESET_THEME:
      return {
        ...state,
        theme: {}
      };
    default:
      return state;
  }
}
