import log from 'electron-log';
import store from '../localStore';


export const LOAD_SETTINGS = "LOAD_SETTINGS";
export const SET_SOUNDS = "SET_SOUNDS";


export function loadSettings() {
  return dispatch => {
    try {
      if (store.has('settings')) {
        const settings = store.get('settings');
        dispatch({
          type: LOAD_SETTINGS,
          payload: settings
        })
      } else {
        dispatch(saveSettings());
      }
    } catch (err) {
      log.error(err.message);
    }
  }
}

export function saveSettings() {
  return (dispatch, getState) => {
    try {
      const { settings } = getState();
      store.set('settings', settings);
    } catch (err) {
      log.error(err.message);
    }
  }
}

export function setSounds(val) {
  return dispatch => {
    try {
      dispatch({ type: SET_SOUNDS, payload: val })
    } catch (err) {
      log.error(err.message);
    }
  }
}