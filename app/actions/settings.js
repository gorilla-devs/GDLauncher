import log from 'electron-log';
import { message } from 'antd';
import _ from 'lodash';
import store from '../localStore';
import { THEMES, DEFAULT_ARGS } from '../constants';

export const LOAD_SETTINGS = 'LOAD_SETTINGS';
export const SET_SOUNDS = 'SET_SOUNDS';
export const SET_JAVA_PATH = 'SET_JAVA_PATH';
export const SET_JAVA_MEMORY = 'SET_JAVA_MEMORY';
export const SET_THEME = 'SET_THEME';
export const RESET_THEME = 'RESET_THEME';
export const SET_GLOBAL_JAVA_ARGUMENTS = 'SET_GLOBAL_JAVA_ARGUMENTS';
export const SET_INSTANCES_PATH = 'SET_INSTANCES_PATH';

export function loadSettings() {
  return dispatch => {
    try {
      const isLegacy = (obj, settings) =>
        _.some(Object.keys(obj), key => !_.has(settings, key));

      if (store.has('settings')) {
        let settings = store.get('settings');
        // THEME
        if (
          !settings.theme ||
          Object.keys(settings.theme).length === 0 ||
          isLegacy(THEMES.default, settings.theme)
        ) {
          store.set('settings.theme', THEMES.default);
        }
        // JAVA
        const javaSettings = {
          autodetected: true,
          path: null,
          memory: 3072,
          javaArgs: DEFAULT_ARGS
        };
        if (
          !settings.java ||
          Object.keys(settings.java).length === 0 ||
          isLegacy(javaSettings, settings.java) ||
          typeof settings.java.memory !== 'number'
        ) {
          store.set('settings.java', javaSettings);
        }
        // Reads the settings again after patching
        settings = store.get('settings');

        // Applies all themes
        Object.keys(settings.theme).forEach(val => {
          dispatch(setThemeValue(val, settings.theme[val]));
        });
        dispatch({
          type: LOAD_SETTINGS,
          payload: settings
        });
      } else {
        dispatch(saveSettings(false));
      }
    } catch (err) {
      log.error(err.message);
    }
  };
}

export function saveSettings(notification = false) {
  return (dispatch, getState) => {
    try {
      const { settings } = getState();
      store.set('settings', settings);
      if (notification) {
        message.success('Settings Saved!');
      }
    } catch (err) {
      log.error(err.message);
    }
  };
}

export function setSounds(val) {
  return dispatch => {
    try {
      dispatch({ type: SET_SOUNDS, payload: val });
      dispatch(saveSettings());
    } catch (err) {
      log.error(err.message);
    }
  };
}

export function setJavaPath(autodetected, path = null) {
  return dispatch => {
    dispatch({
      type: SET_JAVA_PATH,
      autodetected,
      path
    });
    dispatch(saveSettings());
  };
}

export function setJavaMemory(amount) {
  return dispatch => {
    dispatch({
      type: SET_JAVA_MEMORY,
      payload: amount
    });
    dispatch(saveSettings());
  };
}

export function setThemeValue(property, value) {
  return dispatch => {
    try {
      const root = document.getElementsByTagName('html')[0];
      root.style.setProperty(`--${property}`, value);
    } catch (err) {
      log.error(err.message);
    }
  };
}

export function saveThemeValue(property, value) {
  return dispatch => {
    try {
      const root = document.getElementsByTagName('html')[0];
      root.style.setProperty(`--${property}`, value);
      dispatch({ type: SET_THEME, payload: { property, value } });
      dispatch(saveSettings());
    } catch (err) {
      log.error(err.message);
    }
  };
}

export function applyTheme(theme) {
  return dispatch => {
    try {
      const root = document.getElementsByTagName('html')[0];
      root.removeAttribute('style');
      Object.keys(theme).forEach(val => {
        if (val === 'name') return;
        dispatch(setThemeValue(val, theme[val]));
        dispatch(saveThemeValue(val, theme[val]));
      });
      dispatch({ type: SET_THEME, payload: theme });
      dispatch(saveSettings());
    } catch (err) {
      log.error(err.message);
    }
  };
}

export function setJavaArgs(args) {
  return dispatch => {
    dispatch({
      type: SET_GLOBAL_JAVA_ARGUMENTS,
      payload: args
    });
    dispatch(saveSettings());
  };
}

export function setInstancesPath(path) {
  return dispatch => {
    dispatch({
      type: SET_INSTANCES_PATH,
      path
    });
    dispatch(saveSettings());
  };
}
