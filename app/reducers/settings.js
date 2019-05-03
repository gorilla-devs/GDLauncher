import {
  LOAD_SETTINGS,
  SET_SOUNDS,
  SET_JAVA_PATH,
  SET_JAVA_MEMORY,
  SET_THEME,
  RESET_THEME,
  SET_GLOBAL_JAVA_ARGUMENTS,
  SET_INSTANCES_PATH
} from '../actions/settings';
import { THEMES, DEFAULT_ARGS, DEFAULT_MEMORY, INSTANCES_PATH } from '../constants';

const initialState = {
  sounds: true,
  java: {
    autodetected: true,
    path: null,
    memory: DEFAULT_MEMORY,
    javaArgs: DEFAULT_ARGS
  },
  theme: THEMES.default,
  instancesPath: INSTANCES_PATH
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
    case SET_INSTANCES_PATH:
      return {
        ...state,
        instancesPath: action.path
      };
    default:
      return state;
  }
}
