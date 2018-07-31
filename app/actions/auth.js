import axios from 'axios';
import { push } from 'react-router-redux';
import { message } from 'antd';
import path from 'path';
import fsa from 'fs-extra';
import os from 'os';
import store from '../localStore';
import { LOGIN_PROXY_API, ACCESS_TOKEN_VALIDATION_URL, WINDOWS, LINUX, DARWIN } from '../constants';

export const LOGOUT = 'LOGOUT';
export const START_AUTH_LOADING = 'START_AUTH_LOADING';
export const STOP_AUTH_LOADING = 'STOP_AUTH_LOADING';
export const START_TOKEN_CHECK_LOADING = 'START_TOKEN_CHECK_LOADING';
export const STOP_TOKEN_CHECK_LOADING = 'STOP_TOKEN_CHECK_LOADING';
export const AUTH_SUCCESS = 'AUTH_SUCCESS';
export const AUTH_FAILED = 'AUTH_FAILED';
export const OPEN_NATIVE_PROFILES_MODAL = 'OPEN_NATIVE_PROFILES_MODAL';
export const CLOSE_NATIVE_PROFILES_MODAL = 'CLOSE_NATIVE_PROFILES_MODAL';

export function login(username, password, remember) {
  return async (dispatch) => {
    dispatch({
      type: START_AUTH_LOADING
    });
    try {
      await axios.post(
        LOGIN_PROXY_API,
        {
          username,
          password
        }
      ).then(res => {
        if (res.data !== undefined &&
          res.data !== null &&
          Object.prototype.hasOwnProperty.call(res.data, 'authenticated')) {
          if (remember) {
            store.set({
              user: {
                username: res.data.username,
                accessToken: res.data.accessToken,
                clientToken: res.data.clientToken,
                legacy: res.data.legacy,
                uuid: res.data.uuid
              },
              lastEmail: username
            });
          }
          dispatch({
            type: AUTH_SUCCESS,
            payload: res.data
          });

          dispatch(push('/home'));
        } else {
          message.error('Wrong username or password');
          dispatch({
            type: AUTH_FAILED,
            payload: res.data
          });
        }
        return res;
      });
    } catch (err) {
      message.error(`Auth failed: ${err.message}`);
    } finally {
      dispatch({
        type: STOP_AUTH_LOADING
      });
    }
  };
}

export function logout() {
  return (dispatch) => {
    store.delete('user');
    dispatch({
      type: LOGOUT
    });
    dispatch(push('/'));
  };
}

export function checkAccessToken(userData = store.get('user')) {
  return async (dispatch) => {
    if (userData) {
      dispatch({
        type: START_TOKEN_CHECK_LOADING
      });
      try {
        message.loading('Checking AccessToken Validity...');
        const res = await axios.post(
          ACCESS_TOKEN_VALIDATION_URL,
          { accessToken: userData.accessToken },
          { 'Content-Type': 'application/json;charset=UTF-8' }
        );
        if (res.status === 204) {
          dispatch({
            type: AUTH_SUCCESS,
            payload: userData
          });
          dispatch(push('/home'));
        }
        return res;
      } catch (error) {
        // This clears the loader just if the token is not valid.
        message.destroy();
        if (error.response && error.response.status === 403) {
          message.error('Token Not Valid. You Need To Log-In Again :(');
          store.delete('user');
          dispatch({
            type: AUTH_FAILED
          });
        } else if (error.message === 'Network Error') {
          message.info('You are offline. Logging in in offline-mode');
          dispatch({
            type: AUTH_SUCCESS,
            payload: userData
          });
          dispatch(push('/home'));
        }
      } finally {
        dispatch({
          type: STOP_TOKEN_CHECK_LOADING
        });
      }
    }
  };
}

export function tryNativeLauncherProfiles() {
  return async (dispatch) => {
    const homedir = process.env.APPDATA || os.homedir();
    const vanillaMCPath = path.join(homedir, '.minecraft');
    try {
      const vnlJson = await fsa.readJson(path.join(vanillaMCPath, 'launcher_profiles.json'));
      const { clientToken } = vnlJson;
      const { account, profile } = vnlJson.selectedUser;
      const { accessToken, username, profiles } = vnlJson.authenticationDatabase[account];
      const { displayName } = profiles[profile];
      const uuid = `${profile.slice(0, 8)}-${profile.slice(8, 12)}-${profile.slice(12, 16)}-${profile.slice(16, 20)}-${profile.slice(20)}`;
      const userData = {
        uuid,
        username: displayName,
        accessToken,
        clientToken,
        lastEmail: username,
        legacy: false
      };
      dispatch(checkAccessToken(userData));
    } catch (err) { console.log(err); }
  };
}

export function openNativeProfiles() {
  return dispatch => dispatch({ type: OPEN_NATIVE_PROFILES_MODAL });
}

export function closeNativeProfiles() {
  return dispatch => dispatch({ type: CLOSE_NATIVE_PROFILES_MODAL });
}