// @flow
import axios from "axios";
import {
  MOJANG_APIS,
  FORGESVC_URL,
  MC_MANIFEST_URL,
  FABRIC_APIS,
  JAVA_MANIFEST_URL
} from "./utils/constants";
import { sortByDate } from "./utils";

export const mcAuthenticate = (username, password, clientToken) => {
  return axios.post(
    `${MOJANG_APIS}/authenticate`,
    {
      agent: {
        name: "Minecraft",
        version: 1
      },
      username,
      password,
      clientToken,
      requestUser: true
    },
    { headers: { "Content-Type": "application/json" } }
  );
};

export const mcValidate = (accessToken, clientToken) => {
  return axios.post(
    `${MOJANG_APIS}/validate`,
    {
      accessToken,
      clientToken
    },
    { headers: { "Content-Type": "application/json" } }
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
    { headers: { "Content-Type": "application/json" } }
  );
};

export const mcGetPlayerSkin = uuid => {
  return axios.get(
    `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`
  );
};

export const mcInvalidate = (accessToken, clientToken) => {
  return axios.post(
    `${MOJANG_APIS}/invalidate`,
    {
      accessToken,
      clientToken
    },
    { headers: { "Content-Type": "application/json" } }
  );
};

export const getMcManifest = () => {
  const url = `${MC_MANIFEST_URL}?timestamp=${new Date().getTime()}`;
  return axios.get(url);
};

export const getForgeManifest = () => {
  const url = `${FORGESVC_URL}/minecraft/modloader?timestamp=${new Date().getTime()}`;
  return axios.get(url);
};

export const getFabricManifest = () => {
  const url = `${FABRIC_APIS}/v2/versions?timestamp=${new Date().getTime()}`;
  return axios.get(url);
};

export const getJavaManifest = () => {
  const url = JAVA_MANIFEST_URL;
  return axios.get(url);
};

export const getFabricJson = ([, , yarn, loader]) => {
  return axios.get(
    `https://fabricmc.net/download/technic/?yarn=${encodeURIComponent(
      yarn
    )}&loader=${encodeURIComponent(loader)}`
  );
};

export const getForgeJson = ([, , forgeVersion]) => {
  return axios.get(
    `https://addons-ecs.forgesvc.net/api/v2/minecraft/modloader/forge-${forgeVersion}`
  );
};

// FORGE ADDONS

export const getAddon = addonID => {
  const url = `${FORGESVC_URL}/addon/${addonID}`;
  return axios.get(url);
};

export const getAddonFiles = addonID => {
  const url = `${FORGESVC_URL}/addon/${addonID}/files`;
  return axios.get(url).then(res => ({
    ...res,
    data: res.data.sort(sortByDate)
  }));
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

export const getSearch = (
  type,
  searchFilter,
  pageSize,
  index,
  sort,
  isSortDescending,
  gameVersion
) => {
  const url = `${FORGESVC_URL}/addon/search`;
  const params = {
    gameId: 432,
    sectionId: type === "mods" ? 6 : 4471,
    categoryId: 0,
    pageSize,
    sort,
    isSortDescending,
    index,
    searchFilter,
    gameVersion:
      gameVersion !== undefined && gameVersion !== null ? gameVersion : ""
  };
  return axios.get(url, { params });
};
