import axios from 'axios';

export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';

export function login(username, password) {
  const authData = axios.post(
    'https://n7x0m4zh4f.execute-api.eu-west-1.amazonaws.com/Staging/login',
    {
      username,
      password
    }
  );
  return (dispatch) => {
    dispatch({
      type: LOGIN,
      payload: authData
    });
  };
}

export function logout() {
  return (dispatch) => {
    dispatch({
      type: LOGOUT
    });
  };
}
