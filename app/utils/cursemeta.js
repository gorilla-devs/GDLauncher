// @flow

import axios from 'axios';
import log from 'electron-log';
import { CURSEMETA_API_URL } from '../constants';

const makeRequest = async (url: string, params: {} = {}) => {
  const requestPayload = {
    params
  };
  try {
    const response = await axios.get(url, requestPayload);
    return response.data;
  } catch (err) {
    log.error(err);
  }
};

export const getAddon = async (addonID: number | string) => {
  const url = `${CURSEMETA_API_URL}/addon/${addonID}`;
  return makeRequest(url);
};

export const getAddonFiles = async (addonID: number | string) => {
  const url = `${CURSEMETA_API_URL}/addon/${addonID}/files`;
  return makeRequest(url);
};

export const getAddonDescription = async (addonID: number | string) => {
  const url = `${CURSEMETA_API_URL}/addon/${addonID}/description`;
  return makeRequest(url);
};

export const getAddonFile = async (
  addonID: number | string,
  fileID: number | string
) => {
  const url = `${CURSEMETA_API_URL}/addon/${addonID}/file/${fileID}`;
  return makeRequest(url);
};

export const getAddonFileIDFromVersion = async (
  addonID: number | string,
  modpackVersion: string
) => {
  const files = await getAddonFiles(addonID);
  const foundID = files.find(a => a.fileNameOnDisk.includes(modpackVersion));
  return foundID ? foundID.id : null;
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
  return makeRequest(url, params);
};
