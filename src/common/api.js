// @flow
import axios from 'axios';
import qs from 'querystring';
import path from 'path';
import fse from 'fs-extra';
import os from 'os';
import { version as appVersion } from '../../package.json';
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
  MODRINTH_API_URL,
  JAVA_LATEST_MANIFEST_URL
} from './utils/constants';
import { sortByDate } from './utils';
import ga from './utils/analytics';
import { downloadFile } from '../app/desktop/utils/downloader';
// eslint-disable-next-line import/no-cycle
import { extractAll } from '../app/desktop/utils';

const axioInstance = axios.create({
  headers: {
    'X-API-KEY': '$2a$10$5BgCleD8.rLQ5Ix17Xm2lOjgfoeTJV26a1BXmmpwrOemgI517.nuC',
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

const modrinthClient = axios.create({
  baseURL: MODRINTH_API_URL,
  headers: {
    'User-Agent': `gorilla-devs/GDLauncher/${appVersion}`
  }
});

const trackFTBAPI = () => {
  ga.sendCustomEvent('FTBAPICall');
};

const trackModrinthAPI = () => {
  ga.sendCustomEvent('ModrinthAPICall');
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
  const { data } = await axioInstance.get(url);
  return data?.data;
};

export const getMultipleAddons = async addons => {
  trackCurseForgeAPI();
  const url = `${FORGESVC_URL}/mods`;
  const { data } = await axioInstance.post(
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
    const { data } = await axioInstance.get(url);
    results.push(...(data.data || []));

    hasMore = data.pagination.totalCount > results.length;
  }

  return results.sort(sortByDate);
};

export const getAddonDescription = async projectID => {
  trackCurseForgeAPI();
  const url = `${FORGESVC_URL}/mods/${projectID}/description`;
  const { data } = await axioInstance.get(url);
  return data?.data;
};

export const getAddonFile = async (projectID, fileID) => {
  trackCurseForgeAPI();
  const url = `${FORGESVC_URL}/mods/${projectID}/files/${fileID}`;
  const { data } = await axioInstance.get(url);
  return data?.data;
};

export const getAddonsByFingerprint = async fingerprints => {
  trackCurseForgeAPI();
  const url = `${FORGESVC_URL}/fingerprints`;
  const { data } = await axioInstance.post(url, { fingerprints });

  return data?.data;
};

export const getAddonFileChangelog = async (projectID, fileID) => {
  trackCurseForgeAPI();
  const url = `${FORGESVC_URL}/mods/${projectID}/files/${fileID}/changelog`;
  const { data } = await axioInstance.get(url);

  return data?.data;
};

export const getCurseForgeCategories = async () => {
  trackCurseForgeAPI();
  const url = `${FORGESVC_URL}/categories?gameId=432`;
  const { data } = await axioInstance.get(url);
  return data.data;
};

export const getCFVersionIds = async () => {
  trackCurseForgeAPI();
  const url = `${FORGESVC_URL}/games/432/versions`;
  const { data } = await axioInstance.get(url);
  return data.data;
};

export const getCurseForgeSearch = async (
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

  const { data } = await axioInstance.get(url, { params });
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

/**
 * @param {number} offset
 * @returns {Promise<ModrinthSearchResult[]>}
 */
export const getModrinthMostPlayedModpacks = async (offset = 0) => {
  trackModrinthAPI();
  const url = `/search?limit=20&offset=${offset}&index=downloads&facets=[["project_type:modpack"]]`;
  const { data } = await modrinthClient.get(url);
  return data;
};

/**
 * @param {string} query
 * @param {'mod'|'modpack'} projectType
 * @param {string} gameVersion
 * @param {string[]} categories
 * @param {number} index
 * @param {number} offset
 * @returns {Promise<ModrinthSearchResult[]>}
 */
export const getModrinthSearchResults = async (
  query,
  projectType,
  gameVersion = null,
  categories = [],
  index = 'relevance',
  offset = 0
) => {
  trackModrinthAPI();
  const facets = [];

  if (projectType === 'MOD') {
    facets.push(['project_type:mod']);
  }
  if (projectType === 'MODPACK') {
    facets.push(['project_type:modpack']);
  }
  if (gameVersion) {
    facets.push([`versions:${gameVersion}`]);
  }
  // remove falsy values (i.e. null/undefined) from categories before constructing facets
  const filteredCategories = categories.filter(cat => !!cat);
  if (filteredCategories) {
    facets.push(...filteredCategories.map(cat => [`categories:${cat}`]));
  }

  const { data } = await modrinthClient.get(`/search`, {
    params: {
      limit: 20,
      query: query ?? undefined,
      facets: facets ? JSON.stringify(facets) : undefined,
      index: index ?? undefined,
      offset: offset ?? undefined
    }
  });

  return data;
};

/**
 * @param {string} projectId
 * @returns {Promise<ModrinthProject>}
 */
export const getModrinthProject = async projectId => {
  return (await getModrinthProjects([projectId])).at(0) ?? null;
};

/**
 * @param {string[]} projectIds
 * @returns {Promise<ModrinthProject[]>}
 */
export const getModrinthProjects = async projectIds => {
  trackModrinthAPI();
  try {
    const url = `/projects?ids=${JSON.stringify(projectIds)}`;
    const { data } = await modrinthClient.get(url);
    return data.map(fixModrinthProjectObject);
  } catch {
    return { status: 'error' };
  }
};

/**
 * @param {string} projectId
 * @returns {Promise<ModrinthVersion[]>}
 */
export const getModrinthProjectVersions = async projectId => {
  trackModrinthAPI();
  try {
    const url = `/project/${projectId}/version`;
    const { data } = await modrinthClient.get(url);
    return data;
  } catch {
    return { status: 'error' };
  }
};

/**
 * @param {string} versionId
 * @returns {Promise<ModrinthVersion>}
 */
export const getModrinthVersion = async versionId => {
  return (await getModrinthVersions([versionId])).at(0) ?? null;
};

/**
 * @param {string[]} versionIds
 * @returns {Promise<ModrinthVersion[]>}
 */
export const getModrinthVersions = async versionIds => {
  trackModrinthAPI();
  try {
    const url = `versions?ids=${JSON.stringify(versionIds)}`;
    const { data } = await modrinthClient.get(url);
    return data || [];
  } catch (err) {
    console.error(err);
  }
};

// TODO: Move override logic out of this function
// TODO: Do overrides need to be applied after the pack is installed?
/**
 * @param {string} versionId
 * @param {string} instancePath
 * @returns {Promise<ModrinthManifest>}
 */
export const getModrinthVersionManifest = async (versionId, instancePath) => {
  try {
    // get download link for the metadata archive
    const version = await getModrinthVersion(versionId);
    const file = version.files.find(f => f.filename.endsWith('.mrpack'));

    // clean temp directory
    const tmp = path.join(os.tmpdir(), 'GDLauncher_Download');
    await fse.rm(tmp, { recursive: true, force: true });

    // download metadata archive
    await downloadFile(path.join(tmp, file.filename), file.url);

    // Wait 500ms to avoid `The process cannot access the file because it is being used by another process.`
    await new Promise(resolve => {
      setTimeout(() => resolve(), 500);
    });

    // extract archive to temp folder
    await extractAll(path.join(tmp, file.filename), tmp, { yes: true });

    await fse.move(path.join(tmp, 'overrides'), path.join(instancePath), {
      overwrite: true
    });

    // move manifest to instance root
    await fse.move(
      path.join(tmp, 'modrinth.index.json'),
      path.join(instancePath, 'modrinth.index.json'),
      { overwrite: true }
    );

    // clean temp directory
    await fse.rm(tmp, { recursive: true, force: true });

    const manifest = await fse.readJson(
      path.join(instancePath, 'modrinth.index.json')
    );

    return manifest;
  } catch (err) {
    console.error(err);

    return { status: 'error' };
  }
};

/**
 * @param {string} versionId
 * @returns {Promise<string>}
 */
export const getModrinthVersionChangelog = async versionId => {
  return (await getModrinthVersion(versionId)).changelog;
};

/**
 * @param {string} userId
 * @returns {Promise<ModrinthUser>}
 */
export const getModrinthUser = async userId => {
  trackModrinthAPI();
  try {
    const url = `/user/${userId}`;
    const { data } = modrinthClient.get(url);
    return data;
  } catch (err) {
    console.error(err);
  }
};

//! HACK
const fixModrinthProjectObject = project => {
  return {
    ...project,
    name: project.title
  };
};

/**
 * @returns {Promise<ModrinthCategory>}
 */
export const getModrinthCategories = async () => {
  trackModrinthAPI();
  try {
    const url = '/tag/category';
    const { data } = await modrinthClient.get(url);
    return data;
  } catch (err) {
    console.error(err);
  }
};

/**
 * @param {string} projectId
 * @returns {Promise<ModrinthTeamMember[]>}
 */
export const getModrinthProjectMembers = async projectId => {
  trackModrinthAPI();
  try {
    const url = `/project/${projectId}/members`;
    const { data } = await modrinthClient.get(url);
    return data;
  } catch (err) {
    console.error(err);
  }
};

/**
 * @param {string[]} hashes
 * @param {'sha1' | 'sha512'} algorithm
 * @returns {Promise<{[hash: string]: ModrinthVersion}[]>}
 */
export const getVersionsFromHashes = async (hashes, algorithm) => {
  trackModrinthAPI();
  try {
    const url = '/version_files';
    const { data } = await modrinthClient.post(url, { hashes, algorithm });
    return data;
  } catch (err) {
    console.error(err);
  }
};
