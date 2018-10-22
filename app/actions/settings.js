import log from 'electron-log';
import { message } from 'antd';
import store from '../localStore';
import colors from '../style/theme/colors.scss';

export const LOAD_SETTINGS = 'LOAD_SETTINGS';
export const SET_SOUNDS = 'SET_SOUNDS';
export const SET_THEME = 'SET_THEME';
export const RESET_THEME = 'RESET_THEME';

const defaultTheme = {
  primary: colors.primary,
  'secondary-color-1': colors.secondarycolor1,
  'secondary-color-2': colors.secondarycolor2,
  'secondary-color-3': colors.secondarycolor3
};

export function loadSettings() {
  return dispatch => {
    try {
      if (store.has('settings')) {
        let settings = store.get('settings');
        if (!settings.theme || Object.keys(settings.theme).length === 0) {
          store.set('settings.theme', defaultTheme);
        }
        settings = store.get('settings');
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

export function resetStyles() {
  return dispatch => {
    try {
      Object.keys(defaultTheme).forEach(val => {
        dispatch(setThemeValue(val, defaultTheme[val]));
      });
      dispatch({ type: RESET_THEME, payload: defaultTheme });
      dispatch(saveSettings());
    } catch (err) {
      log.error(err.message);
    }
  };
}
