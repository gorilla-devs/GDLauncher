import axios from 'axios';
import {
  LOGIN_API,
  ACCESS_TOKEN_VALIDATION_URL,
  ACCESS_TOKEN_REFRESH_URL
} from './constants';

export const minecraftLogin = (username, password, clientToken) => {
  return axios.post(
    LOGIN_API,
    {
      agent: {
        name: 'Minecraft',
        version: 1
      },
      username,
      password,
      clientToken,
      requestUser: true
    },
    { headers: { 'Content-Type': 'application/json' } }
  );
};

export const minecraftCheckAccessToken = (accessToken, clientToken) => {
  return axios.post(
    ACCESS_TOKEN_VALIDATION_URL,
    {
      accessToken,
      clientToken
    },
    { headers: { 'Content-Type': 'application/json' } }
  );
};

export const minecraftRefreshAccessToken = (accessToken, clientToken) => {
  return axios.post(
    ACCESS_TOKEN_REFRESH_URL,
    {
      accessToken,
      clientToken,
      requestUser: true
    },
    { headers: { 'Content-Type': 'application/json' } }
  );
};
