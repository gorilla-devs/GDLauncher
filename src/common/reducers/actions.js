import axios from "axios";
import path from "path";
import { remote, ipcRenderer } from "electron";
import os from "os";
import uuid from "uuid/v1";
import fse from "fs-extra";
import semver, { coerce } from "semver";
import omitBy from "lodash.omitby";
import { extractFull } from "node-7z";
import { push } from "connected-react-router";
import makeDir from "make-dir";
import * as ActionTypes from "./actionTypes";
import { NEWS_URL, FORGESVC_URL } from "../utils/constants";
import {
  mcAuthenticate,
  mcRefresh,
  mcInvalidate,
  getFabricManifest,
  getMcManifest,
  getForgeManifest,
  mcValidate,
  getLauncherManifest
} from "../api";
import {
  _getCurrentAccount,
  _getCurrentDownloadItem,
  _getJavaPath
} from "../utils/selectors";
import {
  mavenToArray,
  librariesMapper,
  convertOSToMCFormat,
  get7zPath,
  readConfig,
  fixFilePermissions
} from "../../app/desktop/utils";
import { downloadFile, downloadArr } from "../../app/desktop/utils/downloader";
import { removeDuplicates } from "../utils";
import { promisify } from "util";
import { exec } from "child_process";
import { updateJavaPath } from "./settings/actions";

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
    const launcher = (await getLauncherManifest()).data;
    dispatch({
      type: ActionTypes.UPDATE_LAUNCHER_MANIFEST,
      data: launcher
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
    return {
      mc,
      fabric,
      launcher,
      forge
    };
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

export function updateJavaStatus(status) {
  return async dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_JAVA_DOWNLOAD,
      status
    });
  };
}

export function updateDownloadProgress(percentage) {
  return (dispatch, getState) => {
    const { currentDownload } = getState();
    dispatch({
      type: ActionTypes.UPDATE_DOWNLOAD_PROGRESS,
      name: currentDownload,
      percentage: Number(percentage.toFixed())
    });
  };
}

export function downloadJava() {
  return async (dispatch, getState) => {
    const {
      app: { launcherManifest }
    } = getState();
    const mcOs = convertOSToMCFormat(os.type());
    const { version, url } = launcherManifest[mcOs][64].jre;
    const javaBaseFolder = path.join(remote.app.getPath("userData"), "java");
    const tempFolder = path.join(remote.app.getPath("userData"), "temp");
    await fse.remove(javaBaseFolder);
    const downloadLocation = path.join(tempFolder, path.basename(url));

    let i = 0;
    await downloadFile(downloadLocation, url, p => {
      if (i % 4 === 0) {
        ipcRenderer.send("update-progress-bar", parseInt(p, 10) / 100);
        dispatch(updateJavaStatus(p));
      }
      i += 1;
    });
    await makeDir(path.join(javaBaseFolder, version));

    const firstExtraction = extractFull(downloadLocation, tempFolder, {
      $bin: get7zPath()
    });
    await new Promise((resolve, reject) => {
      firstExtraction.on("end", () => {
        resolve();
      });
      firstExtraction.on("error", err => {
        reject(err);
      });
    });

    const secondExtraction = extractFull(
      path.join(tempFolder, path.basename(url, ".lzma")),
      path.join(javaBaseFolder, version),
      {
        $bin: get7zPath()
      }
    );
    await new Promise((resolve, reject) => {
      secondExtraction.on("end", () => {
        resolve();
      });
      secondExtraction.on("error", err => {
        reject(err);
      });
    });
    await fse.remove(tempFolder);

    await fixFilePermissions(_getJavaPath(getState()));

    dispatch(updateJavaPath(_getJavaPath(getState())));

    ipcRenderer.send("update-progress-bar", -1);
    dispatch(updateJavaStatus("downloaded"));
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

    const homedir = remote.app.getPath("appData");
    const vanillaMCPath = path.join(homedir, ".minecraft");
    const vnlJson = await fse.readJson(
      path.join(vanillaMCPath, "launcher_profiles.json")
    );

    try {
      const { clientToken } = vnlJson;
      const { account } = vnlJson.selectedUser;
      const { accessToken } = vnlJson.authenticationDatabase[account];

      const { data } = await mcRefresh(accessToken, clientToken);

      // We need to update the accessToken in launcher_profiles.json
      vnlJson.authenticationDatabase[account].accessToken = data.accessToken;
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
export function downloadInstance(instanceName, mcVersion, repair) {
  return async (dispatch, getState) => {
    const {
      app: {
        vanillaManifest: { versions: mcVersions }
      },
      settings: { dataPath }
    } = getState();

    const itemFromQueue = _getCurrentDownloadItem(getState());
    let mcJson;

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

    const libraries = removeDuplicates(
      librariesMapper(mcJson.libraries, dataPath),
      "url"
    );

    let timePlayed = 0;

    if (repair) {
      try {
        const prevConfig = await readConfig(pack);
        timePlayed = prevConfig.timePlayed;
      } catch {
        console.log("Could not find a valid config - using defaults");
      }
    }

    await fse.outputJson(path.join(dataPath, instanceName, "config.json"), {
      version: mcVersion,
      timePlayed
    });

    const updatePercentage = downloaded => {
      dispatch(
        updateDownloadProgress(
          (downloaded * 100) / assets.length + libraries.length + 1
        )
      );
    };

    await downloadArr(
      [...libraries, ...assets, mcMainFile],
      updatePercentage,
      instanceName,
      true
    );
  };
}
/* eslint-enable */
