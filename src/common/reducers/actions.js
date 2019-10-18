import axios from "axios";
import path from "path";
import os from "os";
import uuid from "uuid/v1";
import fse from "fs-extra";
import semver, { coerce } from "semver";
import omitBy from "lodash.omitby";
import { push } from "connected-react-router";
import * as ActionTypes from "./actionTypes";
import { NEWS_URL, FORGESVC_URL } from "../utils/constants";
import {
  mcAuthenticate,
  mcRefresh,
  mcInvalidate,
  getFabricManifest,
  getMcManifest,
  getForgeManifest,
  mcValidate
} from "../api";
import { _getCurrentAccount } from "../utils/selectors";
import { mavenToArray, librariesMapper } from "../../app/desktop/utils";
import { downloadFile } from "../../app/desktop/utils/downloader";

export function initManifests() {
  return async dispatch => {
    const mc = (await getMcManifest()).data;
    dispatch({
      type: ActionTypes.UPDATE_VANILLA_MANIFEST,
      data: mc
    });
    const fabric = (await getFabricManifest()).data;
    dispatch({
      type: ActionTypes.UPDATE_FABRIC_MANIFEST,
      data: fabric
    });
    const forge = (await getForgeManifest()).data;
    const forgeVersions = {};
    // Looping over vanilla versions, create a new entry in forge object
    // and add to it all correct versions
    mc.versions.forEach(v => {
      forgeVersions[v.id] = forge
        .filter(ver => ver.gameVersion === v.id)
        .map(ver => ver.name.replace("forge-", ""));
    });

    dispatch({
      type: ActionTypes.UPDATE_FORGE_MANIFEST,
      data: omitBy(forgeVersions, v => v.length === 0)
    });
  };
}

export function initNews() {
  return async (dispatch, getState) => {
    const {
      news,
      loading: { minecraftNews }
    } = getState();
    if (news.length === 0 && !minecraftNews.isRequesting) {
      try {
        const res = await axios.get(NEWS_URL);
        const newsArr = await Promise.all(
          res.data.article_grid.map(async item => {
            return {
              title: item.default_tile.title,
              description: item.default_tile.sub_header,
              // We need to get the header image of every article, since
              // the ones present in this json are thumbnails
              image: `https://minecraft.net${item.default_tile.image.imageURL}`,
              url: `https://minecraft.net${item.article_url}`
            };
          })
        );
        dispatch({
          type: ActionTypes.UPDATE_NEWS,
          news: newsArr.splice(0, 12)
        });
      } catch (err) {
        console.error(err.message);
      }
    }
  };
}

export function updateIsUpdateAvailable(isUpdateAvailable) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_IS_UPDATE_AVAILABLE,
      isUpdateAvailable
    });
  };
}

export function updateAccount(uuidVal, account) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_ACCOUNT,
      id: uuidVal,
      account
    });
    dispatch(updateCurrentAccountId(uuidVal));
  };
}

export function removeAccount(id) {
  return async (dispatch, getState) => {
    dispatch({
      type: ActionTypes.REMOVE_ACCOUNT,
      id
    });
    const { app } = getState();
    if (app.accounts.length > 0) {
      dispatch(updateCurrentAccountId(app.accounts[0].selectedProfile.id));
    } else {
      dispatch(updateCurrentAccountId(null));
    }
  };
}

export function updateIsNewUser(isNewUser) {
  return async dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_IS_NEW_USER,
      isNewUser
    });
  };
}

export function updateCurrentAccountId(id) {
  return async dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_CURRENT_ACCOUNT_ID,
      id
    });
  };
}

export function login(username, password) {
  return async (dispatch, getState) => {
    const {
      app: { isNewUser, clientToken }
    } = getState();
    if (!username || !password) {
      throw new Error("No username or password provided");
    }
    try {
      const { data } = await mcAuthenticate(username, password, clientToken);
      dispatch(updateAccount(data.selectedProfile.id, data));

      if (!isNewUser) {
        dispatch(push("/home"));
      } else {
        dispatch(updateIsNewUser(false));
        dispatch(push("/onboarding"));
      }
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }
  };
}

export function loginWithAccessToken() {
  return async (dispatch, getState) => {
    const state = getState();
    const { accessToken, selectedProfile, clientToken } = _getCurrentAccount(
      state
    );
    try {
      await mcValidate(accessToken, clientToken);
      dispatch(push("/home"));
    } catch (error) {
      console.error(error);
      // Trying refreshing the stored access token
      if (error.response && error.response.status === 403) {
        try {
          const { data } = await mcRefresh(accessToken, clientToken);
          dispatch(updateAccount(data.selectedProfile.id, data));
          dispatch(push("/home"));
        } catch (nestedError) {
          console.error(error, nestedError);
          dispatch(removeAccount(selectedProfile.id));
          dispatch(push("/"));
          throw new Error();
        }
      } else if (error.message === "Network Error") {
        dispatch(push("/home"));
      }
    }
  };
}

export function loginThroughNativeLauncher() {
  return async (dispatch, getState) => {
    const {
      app: { isNewUser }
    } = getState();

    const homedir = process.env.APPDATA || os.homedir();
    const vanillaMCPath = path.join(homedir, ".minecraft");
    const vnlJson = await fse.readJson(
      path.join(vanillaMCPath, "launcher_profiles.json")
    );

    const { clientToken } = vnlJson;
    const { account } = vnlJson.selectedUser;
    const { accessToken } = vnlJson.authenticationDatabase[account];
    try {
      const { data } = await mcRefresh(accessToken, clientToken);

      // We need to update the accessToken in launcher_profiles.json
      vnlJson.authenticationDatabase[data.selectedProfile.userId].accessToken =
        data.accessToken;
      await fse.writeJson(
        path.join(vanillaMCPath, "launcher_profiles.json"),
        vnlJson
      );

      dispatch(updateAccount(data.selectedProfile.id, data));

      if (isNewUser) {
        dispatch(updateIsNewUser(false));
        dispatch(push("/onboarding"));
      } else {
        dispatch(push("/home"));
      }
    } catch (err) {
      throw new Error(err);
    }
  };
}

export function logout() {
  return (dispatch, getState) => {
    const state = getState();
    const {
      clientToken,
      accessToken,
      selectedProfile: { id }
    } = _getCurrentAccount(state);
    mcInvalidate(accessToken, clientToken).catch(console.error);
    dispatch(removeAccount(id));
    dispatch(push("/"));
  };
}

export function checkClientToken() {
  return (dispatch, getState) => {
    const {
      app: { clientToken }
    } = getState();
    if (clientToken) return clientToken;
    const newToken = uuid()
      .split("")
      .filter(v => v !== "-")
      .join("");
    dispatch({
      type: ActionTypes.UPDATE_CLIENT_TOKEN,
      clientToken: newToken
    });
    return newToken;
  };
}

export function updateModsManifests(modManifest) {
  return (dispatch, getState) => {
    const {
      app: { modsManifests }
    } = getState();
    if (!modsManifests.find(v => v.projectID === modManifest.projectID)) {
      dispatch({
        type: ActionTypes.UPDATE_MODS_MANIFESTS,
        id: modManifest.projectID,
        modManifest
      });
    }
  };
}

export function removeModsManifests(id) {
  return dispatch => {
    dispatch({
      type: ActionTypes.REMOVE_MOD_MANIFEST,
      id
    });
  };
}

export function updateCurrentDownload(name) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_CURRENT_DOWNLOAD,
      name
    });
  };
}

export function updateSelectedInstance(name) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_SELECTED_INSTANCE,
      name
    });
  };
}

export function addToQueue(instanceName, mcVersion, modloader, isRepair) {
  return (dispatch, getState) => {
    const { currentDownload } = getState();
    dispatch({
      type: ActionTypes.ADD_DOWNLOAD_TO_QUEUE,
      instanceName,
      mcVersion,
      modloader
    });
    if (!currentDownload) {
      dispatch(updateCurrentDownload(instanceName));
      dispatch(downloadInstance(instanceName, isRepair));
    }
  };
}
/* eslint-disable */
export function downloadInstance(instanceName, mcVersion, modloader, repair) {
  return async (dispatch, getState) => {
    const {
      downloadQueue,
      currentDownload,
      app: {
        vanillaManifest: { versions: mcVersions },
        forgeManifest,
        fabricManifest
      },
      settings: { dataPath }
    } = getState();

    const itemFromQueue = downloadQueue[currentDownload];
    let mcJson;
    let modloaderJson;

    // DOWNLOAD MINECRAFT JSON
    const mcJsonPath = path.join(
      dataPath,
      "versions",
      mcVersion,
      `${mcVersion}.json`
    );
    try {
      if (repair) throw new Error("isRepair");
      mcJson = await fse.readJson(mcJsonPath);
    } catch (err) {
      const versionURL = mcVersions.find(v => v.id === mcVersion).url;
      mcJson = (await axios.get(versionURL)).data;
      await fse.outputJson(mcJsonPath, mcJson);
    }

    // COMPUTING MC ASSETS
    let assetsJson;
    const assetsFile = path.join(
      dataPath,
      "assets",
      "indexes",
      `${mcJson.assets}.json`
    );
    try {
      assetsJson = await fse.readJson(assetsFile);
    } catch (e) {
      assetsJson = (await axios.get(mcJson.assetIndex.url)).data;
      await fse.outputJson(assetsFile, assetsJson);
    }

    const assets = Object.entries(assetsJson.objects).map(
      ([assetKey, asset]) => ({
        url: `http://resources.download.minecraft.net/${asset.hash.substring(
          0,
          2
        )}/${asset.hash}`,
        type: "asset",
        path: path.join(
          dataPath,
          "assets",
          "objects",
          asset.hash.substring(0, 2),
          asset.hash
        ),
        legacyPath:
          mcJson.assetIndex.id === "legacy" ||
          !semver.gt(coerce(mcJson.assetIndex.id), coerce("1.7"))
            ? path.join(dataPath, "assets", "virtual", "legacy", assetKey)
            : null,
        resourcesPath: path.join(
          dataPath,
          "instances",
          instanceName,
          "resources",
          assetKey
        )
      })
    );

    const mcMainFile = {
      url: mcJson.downloads.client.url,
      path: path.join(dataPath, "versions", mcJson.id, `${mcJson.id}.jar`)
    };

    if (modloader === "FabricLoader") {
    } else if (modloader.includes("forge-")) {
      const forgeMetaPath = path.join(
        dataPath,
        "meta",
        "net.minecraftforge",
        `${modloader}`,
        `${modloader}.json`
      );
      try {
        if (repair) throw new Error();
        modloaderJson = await fse.readJson(forgeMetaPath);
        await fse.access(
          path.join(
            dataPath,
            "libraries",
            ...mavenToArray(modloaderJson.mavenVersionString)
          )
        );
      } catch (err) {
        modloaderJson = (await axios.get(
          `${FORGESVC_URL}/minecraft/modloader/${modloader}`
        )).data;
        const forgeMainFile = path.join(
          dataPath,
          "libraries",
          ...mavenToArray(modloaderJson.mavenVersionString)
        );
        await downloadFile(forgeMainFile, modloaderJson.downloadUrl, p => {});
        await fse.outputFile(forgeMetaPath, modloaderJson);
      }
      modloaderJson.versionJson = JSON.parse(modloaderJson.versionJson);
      modloaderJson.installProfileJson = JSON.parse(
        modloaderJson.installProfileJson
      );
    }

    const libraries = librariesMapper(
      [...mcJson.libraries, ...modloaderJson.versionJson.libraries],
      dataPath
    );

    console.log(libraries);
    await Promise.all(
      libraries.map(async lib => {
        await axios.get(lib.url);
      })
    );
  };
}
/* eslint-enable */
