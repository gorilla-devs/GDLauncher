import React, { useState, useEffect } from 'react';
import axios from 'axios';
import log from 'electron-log';
import { CURSEMETA_API_URL } from '../constants';

const makeRequest = async (url, params = null) => {
  const requestPayload = {
    params,
    headers: {
      'User-Agent': 'GDLauncher'
    }
  };
  try {
    const response = await axios.get(url, requestPayload);
    console.log(response);
    return response.data;
  } catch (err) {
    log.error(err);
  }
};

export const getAddon = async addonID => {
  const url = `${CURSEMETA_API_URL}/direct/addon/${addonID}`;
  return makeRequest(url);
};

export const getAddonFiles = async addonID => {
  const url = `${CURSEMETA_API_URL}/direct/addon/${addonID}/files`;
  return makeRequest(url);
};

export const getAddonDescription = async addonID => {
  const url = `${CURSEMETA_API_URL}/direct/addon/${addonID}/description`;
  return makeRequest(url);
};

export const getAddonFile = async (addonID, fileID) => {
  const url = `${CURSEMETA_API_URL}/direct/addon/${addonID}/file/${fileID}`;
  return makeRequest(url);
};

export const getSearch = (
  type, // Can be either 'mods' or 'modpacks'
  searchFilter,
  pageSize,
  index,
  sort,
  isSortDescending,
  gameVersion?
) => {
  const url = `${CURSEMETA_API_URL}/direct/addon/search`;
  const params = {
    gameId: 432,
    sectionId: type === 'mods' ? 6 : 4471,
    categoryId: 0,
    pageSize,
    sort,
    isSortDescending,
    ...(gameVersion && gameVersion),
    index,
    searchFilter
  };
  return makeRequest(url, params);
};
