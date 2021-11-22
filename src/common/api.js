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
  JAVA_LATEST_MANIFEST_URL,
  GDL_SERVE_API
} from './utils/constants';
import { sortByDate } from './utils';
import ga from './utils/analytics';

const trackCurseForgeAPI = (url, params = {}, method = 'get') => {
  ga.sendCustomEvent('CurseForgeAPICall');

  // Temporarily disable this
  const switcher = true;
  if (switcher) {
    let req = null;
    if (method === 'get') {
      req = axios.get(url, { params });
    } else if (method === 'post') {
      req = axios.post(url, params);
    }

    if (req) {
      req.catch(console.error);
    }
  }
};

const trackFTBAPI = () => {
  ga.sendCustomEvent('FTBAPICall');
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

export const getAddon = projectID => {
  const url = `${FORGESVC_URL}/addon/${projectID}`;
  const myUrl = `${GDL_SERVE_API}/mods/${projectID}`;
  trackCurseForgeAPI(myUrl);
  return axios.get(url);
};

export const getMultipleAddons = async addons => {
  const url = `${FORGESVC_URL}/addon`;
  const myUrl = `${GDL_SERVE_API}/mods`;
  trackCurseForgeAPI(myUrl, addons, 'post');
  return axios.post(url, addons);
};

export const getAddonFiles = projectID => {
  const url = `${FORGESVC_URL}/addon/${projectID}/files`;
  const myUrl = `${GDL_SERVE_API}/mods/${projectID}/files`;
  trackCurseForgeAPI(myUrl);
  return axios.get(url).then(res => ({
    ...res,
    data: res.data.sort(sortByDate)
  }));
};

export const getAddonDescription = projectID => {
  const url = `${FORGESVC_URL}/addon/${projectID}/description`;
  const myUrl = `${GDL_SERVE_API}/mods/${projectID}/description`;

  trackCurseForgeAPI(myUrl);
  return axios.get(url);
};

export const getAddonFile = (projectID, fileID) => {
  const url = `${FORGESVC_URL}/addon/${projectID}/file/${fileID}`;
  const myUrl = `${GDL_SERVE_API}/mods/${projectID}/files/${fileID}`;

  trackCurseForgeAPI(myUrl);
  return axios.get(url);
};

export const getAddonsByFingerprint = fingerprints => {
  const url = `${FORGESVC_URL}/fingerprint`;
  const myUrl = `${GDL_SERVE_API}/fingerprints`;

  trackCurseForgeAPI(myUrl, fingerprints, 'post');
  return axios.post(url, fingerprints);
};

export const getAddonFileChangelog = (projectID, fileID) => {
  const url = `${FORGESVC_URL}/addon/${projectID}/file/${fileID}/changelog`;
  const myUrl = `${GDL_SERVE_API}/mods/${projectID}/files/${fileID}/changelog`;

  trackCurseForgeAPI(myUrl);
  return axios.get(url);
};

export const getAddonCategories = () => {
  const url = `${FORGESVC_URL}/category?gameId=432`;
  const myUrl = `${GDL_SERVE_API}/categories?gameId=432`;

  trackCurseForgeAPI(myUrl);
  return axios.get(url);
};

export const getSearch = (
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
  const url = `${FORGESVC_URL}/addon/search`;
  const myUrl = `${GDL_SERVE_API}/mods/search`;

  const params = {
    gameId: 432,
    categoryId: categoryId || 0,
    pageSize,
    index,
    sort,
    isSortDescending,
    gameVersion: gameVersion || '',
    ...(modLoaderType === 'fabric' && { modLoaderType: 4 }),
    sectionId: type === 'mods' ? 6 : 4471,
    searchFilter
  };
  trackCurseForgeAPI(myUrl, { ...params, pageSize: 20 });
  return axios.get(url, { params });
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
