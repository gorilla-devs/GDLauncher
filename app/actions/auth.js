import axios from 'axios';
import { push } from 'connected-react-router';
import { message } from 'antd';
import path from 'path';
import fsa from 'fs-extra';
import os from 'os';
import log from 'electron-log';
import store from '../localStore';
import {
  LOGIN_API,
  ACCESS_TOKEN_VALIDATION_URL,
  ACCESS_TOKEN_REFRESH_URL,
} from '../constants';

export const LOGOUT = 'LOGOUT';
export const START_AUTH_LOADING = 'START_AUTH_LOADING';
export const STOP_AUTH_LOADING = 'STOP_AUTH_LOADING';
export const START_TOKEN_CHECK_LOADING = 'START_TOKEN_CHECK_LOADING';
export const STOP_TOKEN_CHECK_LOADING = 'STOP_TOKEN_CHECK_LOADING';
export const AUTH_SUCCESS = 'AUTH_SUCCESS';
export const AUTH_FAILED = 'AUTH_FAILED';
export const START_NATIVE_LOADING = 'START_NATIVE_LOADING';
export const STOP_NATIVE_LOADING = 'STOP_NATIVE_LOADING';

export function login(username, password, remember) {
  return async dispatch => {
    dispatch({
      type: START_AUTH_LOADING
    });
    try {
      const { data, status } = await axios.post(LOGIN_API, {
        agent: {
          name: "Minecraft",
          version: 1
        },
        username,
        password,
        requestUser: true
      }, { headers: { 'Content-Type': 'application/json' }, });
      if (
        status === 200 &&
        data !== undefined &&
        data !== null &&
        Object.prototype.hasOwnProperty.call(data, 'accessToken')
      ) {
        console.log(data)
        const payload = {
          email: data.user.email,
          username: data.user.username,
          displayName: data.selectedProfile.name,
          accessToken: data.accessToken,
          clientToken: data.clientToken,
          legacy: data.selectedProfile.legacyProfile,
          uuid: data.selectedProfile.id,
          userID: data.selectedProfile.userId,
          newUser: true
        };
        if (remember) {
          store.set({
            user: {
              ...payload
            },
            lastUsername: data.user.username
          });
        }
        dispatch({
          type: AUTH_SUCCESS,
          payload
        });

        dispatch(push('/home'));
      } else {
        message.error('Wrong username or password');
        dispatch({
          type: AUTH_FAILED
        });
      }
    } catch (err) {
      console.error(err);
      message.error('Wrong username or password');
    } finally {
      dispatch({
        type: STOP_AUTH_LOADING
      });
    }
  };
}

export function logout() {
  return dispatch => {
    store.delete('user');
    dispatch({
      type: LOGOUT
    });
    dispatch(push('/'));
  };
}

export function checkAccessToken() {
  return async dispatch => {
    const userData = store.get('user');
    if (userData) {
      dispatch({
        type: START_TOKEN_CHECK_LOADING
      });
      try {
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
  /*
  / Since there is no way of checking the validity of an access token
  / while also getting the user data attached to that access token, the
  / "hacky" solution is to refresh the access token (it will send the user 
  / data in the response). After getting a 200 status response, we get the 
  / user data and the access token but also update it in the native launcher
  / profiles json.
  */
  return async dispatch => {
    const homedir = process.env.APPDATA || os.homedir();
    const vanillaMCPath = path.join(homedir, '.minecraft');
    try {
      dispatch({ type: START_NATIVE_LOADING });
      const vnlJson = await fsa.readJson(
        path.join(vanillaMCPath, 'launcher_profiles.json')
      );
      const { account } = vnlJson.selectedUser;
      const { accessToken } = vnlJson.authenticationDatabase[account];
      const res = await axios.post(
        ACCESS_TOKEN_REFRESH_URL,
        {
          accessToken,
          clientToken: vnlJson.clientToken,
          requestUser: true
        },
        { 'Content-Type': 'application/json' }
      );
      if (
        res.status === 200 &&
        res.data !== undefined &&
        res.data !== null &&
        Object.prototype.hasOwnProperty.call(res.data, 'accessToken')
      ) {
        const { data } = res;
        const payload = {
          email: data.user.email,
          username: data.user.username,
          displayName: data.selectedProfile.name,
          accessToken: data.accessToken,
          clientToken: data.clientToken,
          legacy: data.selectedProfile.legacyProfile,
          uuid: data.selectedProfile.id,
          userID: data.selectedProfile.userId,
          newUser: true
        };
        // We need to update the accessToken in launcher_profiles.json
        vnlJson.authenticationDatabase[data.selectedProfile.userId].accessToken =
          data.accessToken;
        await fsa.writeJson(
          path.join(vanillaMCPath, 'launcher_profiles.json'),
          vnlJson
        );
        store.set({
          user: { ...payload },
          lastUsername: data.user.username
        });
        dispatch({
          type: AUTH_SUCCESS,
          payload
        });
        dispatch(push('/home'));
      }
    } catch (err) {
      message.error('We could not log you in through Minecraft Launcher. Invalid data.');
      dispatch({
        type: AUTH_FAILED
      });
      log.error(err);
    } finally {
      dispatch({ type: STOP_NATIVE_LOADING });
    }
  };
}
