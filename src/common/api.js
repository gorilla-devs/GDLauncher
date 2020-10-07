// @flow
import axios from 'axios';
import {
  MOJANG_APIS,
  FORGESVC_URL,
  MC_MANIFEST_URL,
  FABRIC_APIS,
  JAVA_MANIFEST_URL,
  IMGUR_CLIENT_ID,
  FORGESVC_CATEGORIES
} from './utils/constants';

export const mcAuthenticate = (username, password, clientToken) => {
  return axios.post(
    `${MOJANG_APIS}/authenticate`,
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

export const mcValidate = (accessToken, clientToken) => {
  return axios.post(
    `${MOJANG_APIS}/validate`,
    {
      accessToken,
      clientToken
    },
    { headers: { 'Content-Type': 'application/json' } }
  );
};

export const mcRefresh = (accessToken, clientToken) => {
  return axios.post(
    `${MOJANG_APIS}/refresh`,
    {
      accessToken,
      clientToken,
      requestUser: true
    },
    { headers: { 'Content-Type': 'application/json' } }
  );
};

export const mcGetPlayerSkin = uuid => {
  return axios.get(
    `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`
  );
};

export const imgurPost = (image, onProgress) => {
  const bodyFormData = new FormData();
  bodyFormData.append('image', image);

  return axios.post('https://api.imgur.com/3/image', bodyFormData, {
    headers: {
      Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
    },
    ...(onProgress && { onUploadProgress: onProgress })
  });
};

export const mcInvalidate = (accessToken, clientToken) => {
  return axios.post(
    `${MOJANG_APIS}/invalidate`,
    {
      accessToken,
      clientToken
    },
    { headers: { 'Content-Type': 'application/json' } }
  );
};

export const getMcManifest = () => {
  const url = `${MC_MANIFEST_URL}?timestamp=${new Date().getTime()}`;
  return axios.get(url);
};

export const getForgeManifest = () => {
  const url = `https://files.minecraftforge.net/maven/net/minecraftforge/forge/maven-metadata.json?timestamp=${new Date().getTime()}`;
  return axios.get(url);
};

export const getFabricManifest = () => {
  const url = `${FABRIC_APIS}/versions`;
  return axios.get(url);
};

export const getJavaManifest = () => {
  const url = JAVA_MANIFEST_URL;
  return axios.get(url);
};

export const getFabricJson = ([, version, loader]) => {
  return axios.get(
    `${FABRIC_APIS}/versions/loader/${encodeURIComponent(
      version
    )}/${encodeURIComponent(loader)}/profile/json`
  );
};

// FORGE ADDONS

export const getAddon = addonID => {
  const url = `${FORGESVC_URL}/addon/${addonID}`;
  return axios.get(url);
};

export const getMultipleAddons = async addons => {
  const url = `${FORGESVC_URL}/addon`;
  return axios.post(url, addons);
};

export const getAddonFiles = addonID => {
  const url = `${FORGESVC_URL}/addon/${addonID}/files`;
  return axios.get(url);
};

export const getAddonDescription = addonID => {
  const url = `${FORGESVC_URL}/addon/${addonID}/description`;
  return axios.get(url);
};

export const getAddonFile = (addonID, fileID) => {
  const url = `${FORGESVC_URL}/addon/${addonID}/file/${fileID}`;
  return axios.get(url);
};

export const getAddonsByFingerprint = fingerprints => {
  const url = `${FORGESVC_URL}/fingerprint`;
  return axios.post(url, fingerprints);
};

export const getAddonFileChangelog = (addonID, fileID) => {
  const url = `${FORGESVC_URL}/addon/${addonID}/file/${fileID}/changelog`;
  return axios.get(url);
};

export const getAddonCategories = () => {
  return axios.get(FORGESVC_CATEGORIES);
};

export const getSearch = (
  type,
  searchFilter,
  pageSize,
  index,
  sort,
  isSortDescending,
  gameVersion,
  categoryId
) => {
  const url = `${FORGESVC_URL}/addon/search`;
  const params = {
    gameId: 432,
    sectionId: type === 'mods' ? 6 : 4471,
    categoryId: categoryId || 0,
    pageSize,
    sort,
    isSortDescending,
    index,
    searchFilter,
    gameVersion: gameVersion || ''
  };
  return axios.get(url, { params });
};
