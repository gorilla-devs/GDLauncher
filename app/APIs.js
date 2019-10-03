// @flow
import axios from 'axios';
import {
  LOGIN_API,
  ACCESS_TOKEN_VALIDATION_URL,
  ACCESS_TOKEN_REFRESH_URL,
  CURSEMETA_API_URL,
  ACCESS_TOKEN_INVALIDATE_URL
} from './constants';
import { sortByDate } from './utils';

export const minecraftLogin = (
  username: string,
  password: string,
  clientToken: string
) => {
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

export const minecraftCheckAccessToken = (
  accessToken: string,
  clientToken: string
) => {
  return axios.post(
    ACCESS_TOKEN_VALIDATION_URL,
    {
      accessToken,
      clientToken
    },
    { headers: { 'Content-Type': 'application/json' } }
  );
};

export const minecraftRefreshAccessToken = (
  accessToken: string,
  clientToken: string
) => {
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

export const minecraftInvalidateAccessToken = (
  accessToken: string,
  clientToken: string
) => {
  return axios.post(
    ACCESS_TOKEN_INVALIDATE_URL,
    {
      accessToken,
      clientToken
    },
    { headers: { 'Content-Type': 'application/json' } }
  );
};

// FORGE ADDONS

export const getAddon = (addonID: number | string) => {
  const url = `${CURSEMETA_API_URL}/addon/${addonID}`;
  return axios.get(url).then(res => res.data);
};

export const getAddonFiles = (addonID: number | string) => {
  const url = `${CURSEMETA_API_URL}/addon/${addonID}/files`;
  return axios.get(url).then(res => res.data.sort(sortByDate));
};

export const getAddonDescription = (addonID: number | string) => {
  const url = `${CURSEMETA_API_URL}/addon/${addonID}/description`;
  return axios.get(url).then(res => res.data);
};

export const getAddonFile = (
  addonID: number | string,
  fileID: number | string
) => {
  const url = `${CURSEMETA_API_URL}/addon/${addonID}/file/${fileID}`;
  return axios.get(url).then(res => res.data);
};

export const getAddonFileChangelog = (
  addonID: number | string,
  fileID: number | string
) => {
  const url = `${CURSEMETA_API_URL}/addon/${addonID}/file/${fileID}/changelog`;
  return axios.get(url).then(res => res.data);
};

export const getSearch = (
  type: 'mods' | 'modpacks',
  searchFilter: string,
  pageSize: number,
  index: number,
  sort:
    | 'Featured'
    | 'Popularity'
    | 'LastUpdated'
    | 'Name'
    | 'Author'
    | 'TotalDownloads',
  isSortDescending: boolean,
  gameVersion?: string
) => {
  const url = `${CURSEMETA_API_URL}/addon/search`;
  const params: {} = {
    gameId: 432,
    sectionId: type === 'mods' ? 6 : 4471,
    categoryId: 0,
    pageSize,
    sort,
    isSortDescending,
    index,
    searchFilter,
    gameVersion:
      gameVersion !== undefined && gameVersion !== null ? gameVersion : ''
  };
  return axios.get(url, { params }).then(res => res.data);
};
