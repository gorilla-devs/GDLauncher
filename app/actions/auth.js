import axios from 'axios';
import { push } from 'react-router-redux';
import { message } from 'antd';
import store from '../localStore';
import { LOGIN_PROXY_API, ACCESS_TOKEN_VALIDATION_URL } from '../constants';

export const LOGOUT = 'LOGOUT';
export const START_AUTH_LOADING = 'START_AUTH_LOADING';
export const STOP_AUTH_LOADING = 'STOP_AUTH_LOADING';
export const START_TOKEN_CHECK_LOADING = 'START_TOKEN_CHECK_LOADING';
export const STOP_TOKEN_CHECK_LOADING = 'STOP_TOKEN_CHECK_LOADING';
export const AUTH_SUCCESS = 'AUTH_SUCCESS';
export const AUTH_FAILED = 'AUTH_FAILED';

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
        console.log(res)
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
              }
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
      message.error(`Auth failed: ${err}`);
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

export function checkLocalDataValidity(redirectToHome = false) {
  return async (dispatch) => {
    if (store.has('user')) {
      dispatch({
        type: START_TOKEN_CHECK_LOADING
      });
      try {
        const data = store.get('user');
        const res = await axios.post(
          ACCESS_TOKEN_VALIDATION_URL,
          { accessToken: data.accessToken },
          { 'Content-Type': 'application/json;charset=UTF-8' }
        );
        if (res.status === 204) {
          dispatch({
            type: AUTH_SUCCESS,
            payload: data
          });
          if (redirectToHome) {
            dispatch(push('/home'));
          }
        }
        return res;
      } catch (error) {
        message.error('Token expired. You need to log-in again :(');
        store.delete('user');
        dispatch({
          type: AUTH_FAILED
        });
      } finally {
        dispatch({
          type: STOP_TOKEN_CHECK_LOADING
        });
      }
    }
  };
}
