import {
  LOAD_SETTINGS,
  SET_SOUNDS,
  SET_JAVA_PATH,
  SET_JAVA_MEMORY,
  SET_THEME,
  RESET_THEME,
  SET_GLOBAL_JAVA_ARGUMENTS,
  SET_OVERRIDE_JAVA_ARGUMENTS
} from '../actions/settings';
import { THEMES, DEFAULT_ARGS } from '../constants';

const initialState = {
  sounds: true,
  java: {
    autodetected: true,
    path: null,
    memory: 3096,
    javaArgs: DEFAULT_ARGS,
    toggleOverrideJavaArguments: false
  },
  theme: THEMES.default
};

export default function Settings(state = initialState, action) {
  switch (action.type) {
    case LOAD_SETTINGS:
      return action.payload;
    case SET_SOUNDS:
      return {
        ...state,
        sounds: action.payload
      };
    case SET_JAVA_PATH:
      return {
        ...state,
        java: {
          ...state.java,
          autodetected: action.autodetected,
          path: action.path
        }
      };
    case SET_JAVA_MEMORY:
      return {
        ...state,
        java: {
          ...state.java,
          memory: action.payload
        }
      };
    case SET_THEME:
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
        theme: action.payload
      };
    case SET_GLOBAL_JAVA_ARGUMENTS:
      return {
        ...state,
        java: {
          ...state.java,
          javaArgs: action.payload
        }
      };
    case SET_OVERRIDE_JAVA_ARGUMENTS:
      return {
        ...state,
        java: {
          ...state.java,
          toggleOverrideJavaArguments: action.payload
        }
      };
    default:
      return state;
  }
}
