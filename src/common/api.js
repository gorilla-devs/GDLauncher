// @flow
import axios from 'axios';
import qs from 'querystring';
import {
  MOJANG_APIS,
  FORGESVC_URL,
  MC_MANIFEST_URL,
  FABRIC_APIS,
  JAVA_MANIFEST_URL,
  IMGUR_CLIENT_ID,
  MICROSOFT_LIVE_LOGIN_URL,
  MICROSOFT_XBOX_LOGIN_URL,
  MICROSOFT_XSTS_AUTH_URL,
  MINECRAFT_SERVICES_URL,
  FTB_API_URL,
  JAVA_LATEST_MANIFEST_URL
} from './utils/constants';
import { sortByDate } from './utils';
import ga from './utils/analytics';

const trackFTBAPI = () => {
  ga.sendCustomEvent('FTBAPICall');
};

const trackCurseForgeAPI = () => {
  ga.sendCustomEvent('CurseForgeAPICall');
};

// Microsoft Auth
export const msExchangeCodeForAccessToken = (
  clientId,
  redirectUrl,
  code,
  codeVerifier
) => {
  return axios.post(
    `${MICROSOFT_LIVE_LOGIN_URL}/oauth20_token.srf`,
    qs.stringify({
      grant_type: 'authorization_code',
      client_id: clientId,
      scope: 'offline_access xboxlive.signin xboxlive.offline_access',
      redirect_uri: redirectUrl,
      code,
      code_verifier: codeVerifier
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Skip-Origin': 'skip'
      }
    }
  );
};

export const msAuthenticateXBL = accessToken => {
  return axios.post(
    `${MICROSOFT_XBOX_LOGIN_URL}/user/authenticate`,
    {
      Properties: {
        AuthMethod: 'RPS',
        SiteName: 'user.auth.xboxlive.com',
        RpsTicket: `d=${accessToken}` // your access token from step 2 here
      },
      RelyingParty: 'http://auth.xboxlive.com',
      TokenType: 'JWT'
    },
    {
      headers: {
        'x-xbl-contract-version': 1
      }
    }
  );
};

export const msAuthenticateXSTS = xblToken => {
  return axios.post(`${MICROSOFT_XSTS_AUTH_URL}/xsts/authorize`, {
    Properties: {
      SandboxId: 'RETAIL',
      UserTokens: [xblToken]
    },
    RelyingParty: 'rp://api.minecraftservices.com/',
    TokenType: 'JWT'
  });
};

export const msAuthenticateMinecraft = (uhsToken, xstsToken) => {
  return axios.post(
    `${MINECRAFT_SERVICES_URL}/authentication/login_with_xbox`,
    {
      identityToken: `XBL3.0 x=${uhsToken};${xstsToken}`
    }
  );
};

export const msMinecraftProfile = mcAccessToken => {
  return axios.get(`${MINECRAFT_SERVICES_URL}/minecraft/profile`, {
    headers: {
      Authorization: `Bearer ${mcAccessToken}`
    }
  });
};

export const msOAuthRefresh = (clientId, refreshToken) => {
  return axios.post(
    `${MICROSOFT_LIVE_LOGIN_URL}/oauth20_token.srf`,
    qs.stringify({
      grant_type: 'refresh_token',
      scope: 'offline_access xboxlive.signin xboxlive.offline_access',
      client_id: clientId,
      refresh_token: refreshToken
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Skip-Origin': 'skip'
      }
    }
  );
};

// Minecraft API

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
  const url = `https://files.minecraftforge.net/net/minecraftforge/forge/maven-metadata.json?timestamp=${new Date().getTime()}`;
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

export const getJavaLatestManifest = () => {
  const url = JAVA_LATEST_MANIFEST_URL;
  return axios.get(url);
};

export const getFabricJson = ({ mcVersion, loaderVersion }) => {
  return axios.get(
    `${FABRIC_APIS}/versions/loader/${encodeURIComponent(
      mcVersion
    )}/${encodeURIComponent(loaderVersion)}/profile/json`
  );
};

// FORGE ADDONS

export const getAddon = async projectID => {
  trackCurseForgeAPI();
  const url = `${FORGESVC_URL}/mods/${projectID}`;
  const { data } = await axios.get(url);
  return data?.data;
};

export const getMultipleAddons = async addons => {
  trackCurseForgeAPI();
  const url = `${FORGESVC_URL}/mods`;
  const { data } = await axios.post(
    url,
    JSON.stringify({
      modIds: addons
    })
  );
  return data?.data;
};

export const getAddonFiles = async projectID => {
  trackCurseForgeAPI();
  // Aggregate results in case of multiple pages
  const results = [];
  let hasMore = true;

  while (hasMore) {
    const url = `${FORGESVC_URL}/mods/${projectID}/files?pageSize=400&index=${results.length}`;
    const { data } = await axios.get(url);
    results.push(...(data.data || []));

    hasMore = data.pagination.totalCount > results.length;
  }

  return results.sort(sortByDate);
};

export const getAddonDescription = async projectID => {
  trackCurseForgeAPI();
  const url = `${FORGESVC_URL}/mods/${projectID}/description`;
  const { data } = await axios.get(url);
  return data?.data;
};

export const getAddonFile = async (projectID, fileID) => {
  trackCurseForgeAPI();
  const url = `${FORGESVC_URL}/mods/${projectID}/files/${fileID}`;
  const { data } = await axios.get(url);
  return data?.data;
};

export const getAddonsByFingerprint = async fingerprints => {
  trackCurseForgeAPI();
  const url = `${FORGESVC_URL}/fingerprints`;
  const { data } = await axios.post(url, { fingerprints });

  return data?.data;
};

export const getAddonFileChangelog = async (projectID, fileID) => {
  trackCurseForgeAPI();
  const url = `${FORGESVC_URL}/mods/${projectID}/files/${fileID}/changelog`;
  const { data } = await axios.get(url);

  return data?.data;
};

export const getAddonCategories = async () => {
  trackCurseForgeAPI();
  const url = `${FORGESVC_URL}/categories?gameId=432`;
  const { data } = await axios.get(url);
  return data.data;
};

export const getCFVersionIds = async () => {
  trackCurseForgeAPI();
  const url = `${FORGESVC_URL}/games/432/versions`;
  const { data } = await axios.get(url);
  return data.data;
};

export const getSearch = async (
  type,
  searchFilter,
  pageSize,
  index,
  sort,
  isSortDescending,
  gameVersion,
  categoryId,
  modLoaderType
) => {
  trackCurseForgeAPI();
  const url = `${FORGESVC_URL}/mods/search`;

  // Map sort to sortField
  let sortField = 1;
  switch (sort) {
    case 'Popularity':
      sortField = 2;
      break;
    case 'LastUpdated':
      sortField = 3;
      break;
    case 'Name':
      sortField = 4;
      break;
    case 'Author':
      sortField = 5;
      break;
    case 'TotalDownloads':
      sortField = 6;
      break;
    case 'Featured':
    default:
      sortField = 1;
      break;
  }

  const params = {
    gameId: 432,
    categoryId: categoryId || 0,
    pageSize,
    index,
    sortField,
    sortOrder: isSortDescending ? 'desc' : 'asc',
    gameVersion: gameVersion || '',
    ...(modLoaderType === 'fabric' && { modLoaderType: 'Fabric' }),
    classId: type === 'mods' ? 6 : 4471,
    searchFilter
  };
  const { data } = await axios.get(url, { params });
  return data?.data;
};

export const getFTBModpackData = async modpackId => {
  trackFTBAPI();
  try {
    const url = `${FTB_API_URL}/modpack/${modpackId}`;
    const { data } = await axios.get(url);
    return data;
  } catch {
    return { status: 'error' };
  }
};

export const getFTBModpackVersionData = async (modpackId, versionId) => {
  trackFTBAPI();
  try {
    const url = `${FTB_API_URL}/modpack/${modpackId}/${versionId}`;
    const { data } = await axios.get(url);
    return data;
  } catch {
    return { status: 'error' };
  }
};
export const getFTBChangelog = async (modpackId, versionId) => {
  trackFTBAPI();
  try {
    const url = `https://api.modpacks.ch/public/modpack/${modpackId}/${versionId}/changelog`;
    const { data } = await axios.get(url);
    return data;
  } catch {
    return { status: 'error' };
  }
};

export const getFTBMostPlayed = async () => {
  trackFTBAPI();
  const url = `${FTB_API_URL}/modpack/popular/plays/1000`;
  return axios.get(url);
};

export const getFTBSearch = async searchText => {
  trackFTBAPI();
  const url = `${FTB_API_URL}/modpack/search/1000?term=${searchText}`;
  return axios.get(url);
};
