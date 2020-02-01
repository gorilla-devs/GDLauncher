import axios from "axios";
import path from "path";
import { ipcRenderer } from "electron";
import uuid from "uuid/v1";
import fse from "fs-extra";
import coerce from "semver/functions/coerce";
import gte from "semver/functions/gte";
import lt from "semver/functions/lt";
import omitBy from "lodash.omitby";
import { extractFull } from "node-7z";
import { push } from "connected-react-router";
import { spawn } from "child_process";
import makeDir from "make-dir";
import pMap from "p-map";
import * as ActionTypes from "./actionTypes";
import {
  NEWS_URL,
  MC_RESOURCES_URL,
  GDL_LEGACYJAVAFIXER_MOD_URL
} from "../utils/constants";
import {
  mcAuthenticate,
  mcRefresh,
  mcInvalidate,
  getFabricManifest,
  getMcManifest,
  getForgeManifest,
  mcValidate,
  getLauncherManifest,
  getFabricJson,
  getForgeJson,
  getAddonFile
} from "../api";
import {
  _getCurrentAccount,
  _getCurrentDownloadItem,
  _getJavaPath,
  _getMinecraftVersionsPath,
  _getAssetsPath,
  _getInstancesPath,
  _getLibrariesPath,
  _getAccounts
} from "../utils/selectors";
import {
  librariesMapper,
  convertOSToMCFormat,
  get7zPath,
  fixFilePermissions,
  extractNatives,
  getJVMArguments112,
  copyAssetsToResources,
  getJVMArguments113,
  patchForge113,
  mavenToArray,
  copyAssetsToLegacy
} from "../../app/desktop/utils";
import { openModal, closeModal } from "./modals/actions";
import {
  downloadFile,
  downloadInstanceFiles
} from "../../app/desktop/utils/downloader";
import { updateJavaPath } from "./settings/actions";
import { removeDuplicates } from "../utils";

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
    const forge = removeDuplicates((await getForgeManifest()).data, "name");
    const forgeVersions = {};
    // Looping over vanilla versions, create a new entry in forge object
    // and add to it all correct versions
    mc.versions.forEach(v => {
      forgeVersions[v.id] = forge
        .filter(
          ver =>
            ver.gameVersion === v.id &&
            gte(coerce(ver.gameVersion), coerce("1.6.4"))
        )
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
  };
}

export function switchToFirstValidAccount(id) {
  return async (dispatch, getState) => {
    const state = getState();
    const accounts = _getAccounts(state);
    const currentAccountId = id || state.app.currentAccountId;
    let found = null;
    for (let i = 0; i < accounts.length; i += 1) {
      if (found || accounts[i].selectedProfile.id === currentAccountId)
        continue; //eslint-disable-line
      try {
        dispatch(updateCurrentAccountId(accounts[i].selectedProfile.id));
        // eslint-disable-next-line no-await-in-loop
        await dispatch(loginWithAccessToken());
        found = accounts[i].selectedProfile.id;
      } catch {
        dispatch(
          updateAccount(accounts[i].selectedProfile.id, {
            ...accounts[i],
            accessToken: accounts[i].accessToken
          })
        );
        console.error(`Failed to validate ${accounts[i].selectedProfile.id}`);
      }
    }
    if (!found) {
      dispatch(updateCurrentAccountId(null));
    }
    return found;
  };
}

export function removeAccount(id) {
  return async (dispatch, getState) => {
    const state = getState();
    const { currentAccountId } = state.app;
    let newId = id;
    if (currentAccountId === id) {
      newId = await dispatch(switchToFirstValidAccount(id));
    }
    dispatch({
      type: ActionTypes.REMOVE_ACCOUNT,
      id
    });
    return newId;
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
      instanceName: currentDownload,
      percentage: Number(percentage.toFixed())
    });
  };
}

export function downloadJava() {
  return async (dispatch, getState) => {
    const {
      app: { launcherManifest }
    } = getState();
    const mcOs = convertOSToMCFormat(process.platform);
    dispatch(openModal("JavaDownload"));
    const { version, url } = launcherManifest[mcOs][64].jre;
    const userDataPath = await ipcRenderer.invoke("getUserDataPath");
    const javaBaseFolder = path.join(userDataPath, "java");
    const tempFolder = path.join(userDataPath, "temp");
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

    const sevenZipPath = await get7zPath();
    const firstExtraction = extractFull(downloadLocation, tempFolder, {
      $bin: sevenZipPath
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
        $bin: sevenZipPath
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
    dispatch(updateJavaStatus("downloaded"));
    dispatch(closeModal());
  };
}

export function login(username, password, redirect = true) {
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
      dispatch(updateCurrentAccountId(data.selectedProfile.id));

      if (!isNewUser) {
        if (redirect) {
          dispatch(push("/home"));
        }
      } else {
        dispatch(updateIsNewUser(false));
        if (redirect) {
          dispatch(push("/onboarding"));
        }
      }
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }
  };
}

export function loginWithAccessToken(redirect = true) {
  return async (dispatch, getState) => {
    const state = getState();
    const { accessToken, clientToken } = _getCurrentAccount(state);
    if (!accessToken) throw new Error();
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
          dispatch(updateCurrentAccountId(data.selectedProfile.id));
          if (redirect) {
            dispatch(push("/home"));
          }
        } catch (nestedError) {
          console.error(error, nestedError);
          if (redirect) {
            dispatch(push("/"));
          }
          throw new Error();
        }
      } else if (error.message === "Network Error") {
        if (redirect) {
          dispatch(push("/home"));
        }
      }
    }
  };
}

export function loginThroughNativeLauncher() {
  return async (dispatch, getState) => {
    const {
      app: { isNewUser }
    } = getState();

    const homedir = await ipcRenderer.invoke("userDataPath");
    const mcFolder = process.platform === "darwin" ? "minecraft" : ".minecraft";
    const vanillaMCPath = path.join(homedir, mcFolder);
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
      dispatch(updateCurrentAccountId(data.selectedProfile.id));

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

export function updateCurrentDownload(instanceName) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_CURRENT_DOWNLOAD,
      instanceName
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

export function removeDownloadFromQueue(instanceName) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_CURRENT_DOWNLOAD,
      instanceName: null
    });
    dispatch({
      type: ActionTypes.REMOVE_DOWNLOAD_FROM_QUEUE,
      instanceName
    });
  };
}

export function updateDownloadStatus(instanceName, status) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_DOWNLOAD_STATUS,
      status,
      instanceName
    });
    dispatch(updateDownloadProgress(0));
  };
}

export function updateDownloadCurrentPhase(instanceName, status) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_DOWNLOAD_STATUS,
      status,
      instanceName
    });
  };
}

export function addToQueue(instanceName, modloader, manifest) {
  return async (dispatch, getState) => {
    const state = getState();
    const { currentDownload } = state;
    dispatch({
      type: ActionTypes.ADD_DOWNLOAD_TO_QUEUE,
      instanceName,
      modloader,
      manifest
    });
    let timePlayed = 0;

    try {
      const prevConfig = await fse.readJson(
        path.join(_getInstancesPath(state), instanceName, "config.json")
      );
      timePlayed = prevConfig.timePlayed;
    } catch {
      // Do nothing
    }
    fse.outputJson(
      path.join(_getInstancesPath(getState()), instanceName, "config.json"),
      {
        modloader,
        timePlayed
      }
    );
    if (!currentDownload) {
      dispatch(updateCurrentDownload(instanceName));
      dispatch(downloadInstance(instanceName));
    }
  };
}

export function addNextInstanceToCurrentDownload() {
  return (dispatch, getState) => {
    const { downloadQueue } = getState();
    const queueArr = Object.keys(downloadQueue);
    if (queueArr.length > 0) {
      dispatch(updateCurrentDownload(queueArr[0]));
      dispatch(downloadInstance(queueArr[0]));
    }
  };
}

export function downloadFabric(instanceName) {
  return async (dispatch, getState) => {
    const state = getState();
    const { modloader } = _getCurrentDownloadItem(state);

    dispatch(updateDownloadStatus(instanceName, "Downloading fabric files..."));

    let fabricJson;
    const fabricJsonPath = path.join(
      _getLibrariesPath(state),
      "net",
      "fabricmc",
      modloader[1],
      modloader[2],
      "fabric.json"
    );
    try {
      fabricJson = await fse.readJson(fabricJsonPath);
    } catch (err) {
      fabricJson = (await getFabricJson(modloader)).data;
      await fse.outputJson(fabricJsonPath, fabricJson);
    }

    const libraries = librariesMapper(
      fabricJson.libraries,
      _getLibrariesPath(state)
    );

    const updatePercentage = downloaded => {
      dispatch(updateDownloadProgress((downloaded * 100) / libraries.length));
    };

    await downloadInstanceFiles(libraries, updatePercentage);
  };
}

export function downloadForge(instanceName) {
  return async (dispatch, getState) => {
    const state = getState();
    const { modloader } = _getCurrentDownloadItem(state);

    dispatch(updateDownloadStatus(instanceName, "Downloading forge files..."));

    let forgeJson;
    const forgeJsonPath = path.join(
      _getLibrariesPath(state),
      "net",
      "minecraftforge",
      modloader[2],
      `${modloader[2]}.json`
    );
    try {
      forgeJson = await fse.readJson(forgeJsonPath);
      await fse.readFile(
        path.join(
          _getLibrariesPath(state),
          ...mavenToArray(forgeJson.mavenVersionString)
        )
      );
    } catch (err) {
      forgeJson = (await getForgeJson(modloader)).data;
      forgeJson.versionJson = JSON.parse(forgeJson.versionJson);
      if (forgeJson.installProfileJson) {
        forgeJson.installProfileJson = JSON.parse(forgeJson.installProfileJson);
      }
      await fse.outputJson(forgeJsonPath, forgeJson);
    }

    const libraries = librariesMapper(
      forgeJson.versionJson.libraries,
      _getLibrariesPath(state)
    );

    if (lt(coerce(modloader[2]), coerce("10.13.1.1217"))) {
      await downloadFile(
        path.join(_getInstancesPath(state), instanceName, "mods", "LJF.jar"),
        GDL_LEGACYJAVAFIXER_MOD_URL
      );
    }

    const updatePercentage = downloaded => {
      dispatch(updateDownloadProgress((downloaded * 100) / libraries.length));
    };

    await downloadInstanceFiles(libraries, updatePercentage);

    if (forgeJson.installProfileJson) {
      dispatch(updateDownloadStatus(instanceName, "Patching forge..."));
      const installLibraries = librariesMapper(
        forgeJson.installProfileJson.libraries,
        _getLibrariesPath(state)
      );
      await downloadInstanceFiles(installLibraries, () => {});
      await patchForge113(
        forgeJson.installProfileJson,
        path.join(
          _getMinecraftVersionsPath(state),
          `${forgeJson.versionJson.inheritsFrom}.jar`
        ),
        _getLibrariesPath(state),
        _getJavaPath(state),
        (d, t) => dispatch(updateDownloadProgress((d * 100) / t))
      );
    }
  };
}

export function downloadForgeManifestFiles(instanceName) {
  return async (dispatch, getState) => {
    const state = getState();
    const { manifest } = _getCurrentDownloadItem(state);

    dispatch(updateDownloadStatus(instanceName, "Downloading mods..."));

    let modManifests = [];
    await pMap(
      manifest.files,
      async item => {
        const modManifest = (await getAddonFile(item.projectID, item.fileID))
          .data;
        const destFile = path.join(
          _getInstancesPath(state),
          instanceName,
          "mods",
          modManifest.fileName
        );
        await downloadFile(destFile, modManifest.downloadUrl);
        modManifests = modManifests.concat(modManifest);
        dispatch(
          updateDownloadProgress(
            (modManifests.length * 100) / manifest.files.length - 1
          )
        );
      },
      { concurrency: 3 }
    );

    dispatch(updateDownloadStatus(instanceName, "Copying overrides..."));
    const addonPathZip = path.join(
      _getInstancesPath(state),
      instanceName,
      "temp",
      "addon.zip"
    );
    const sevenZipPath = await get7zPath();
    const extraction = extractFull(
      addonPathZip,
      path.join(_getInstancesPath(state), instanceName, "temp"),
      {
        recursive: true,
        $bin: sevenZipPath,
        yes: true,
        $cherryPick: "overrides",
        $progress: true
      }
    );
    await new Promise((resolve, reject) => {
      let progress = 0;
      extraction.on("progress", ({ percent }) => {
        if (percent !== progress) {
          progress = percent;
          dispatch(updateDownloadProgress(percent));
        }
      });
      extraction.on("end", () => {
        resolve();
      });
      extraction.on("error", err => {
        reject(err.stderr);
      });
    });

    dispatch(updateDownloadStatus(instanceName, "Finalizing overrides..."));
    await fse.copy(
      path.join(_getInstancesPath(state), instanceName, "temp", "overrides"),
      path.join(_getInstancesPath(state), instanceName),
      { overwrite: true }
    );
    await fse.remove(path.join(_getInstancesPath(state), instanceName, "temp"));
  };
}

export function downloadInstance(instanceName) {
  return async (dispatch, getState) => {
    const state = getState();
    const {
      app: {
        vanillaManifest: { versions: mcVersions }
      }
    } = state;

    dispatch(updateDownloadStatus(instanceName, "Downloading game files..."));

    const { modloader } = _getCurrentDownloadItem(state);
    const mcVersion = modloader[1];

    let mcJson;

    // DOWNLOAD MINECRAFT JSON
    const mcJsonPath = path.join(
      _getMinecraftVersionsPath(state),
      `${mcVersion}.json`
    );
    try {
      mcJson = await fse.readJson(mcJsonPath);
    } catch (err) {
      const versionURL = mcVersions.find(v => v.id === mcVersion).url;
      mcJson = (await axios.get(versionURL)).data;
      await fse.outputJson(mcJsonPath, mcJson);
    }

    // COMPUTING MC ASSETS
    let assetsJson;
    const assetsFile = path.join(
      _getAssetsPath(state),
      "indexes",
      `${mcJson.assets}.json`
    );
    try {
      assetsJson = await fse.readJson(assetsFile);
    } catch (e) {
      assetsJson = (await axios.get(mcJson.assetIndex.url)).data;
      await fse.outputJson(assetsFile, assetsJson);
    }

    const mcMainFile = {
      url: mcJson.downloads.client.url,
      sha1: mcJson.downloads.client.sha1,
      path: path.join(_getMinecraftVersionsPath(state), `${mcJson.id}.jar`)
    };

    const assets = Object.entries(assetsJson.objects).map(
      ([assetKey, { hash }]) => ({
        url: `${MC_RESOURCES_URL}/${hash.substring(0, 2)}/${hash}`,
        type: "asset",
        sha1: hash,
        path: path.join(
          _getAssetsPath(state),
          "objects",
          hash.substring(0, 2),
          hash
        ),
        resourcesPath: path.join(
          _getInstancesPath(state),
          instanceName,
          "resources",
          assetKey
        ),
        legacyPath: path.join(
          _getAssetsPath(state),
          "virtual",
          "legacy",
          assetKey
        )
      })
    );

    const libraries = librariesMapper(
      mcJson.libraries,
      _getLibrariesPath(state)
    );

    const updatePercentage = downloaded => {
      dispatch(
        updateDownloadProgress(
          (downloaded * 100) / (assets.length + libraries.length + 1)
        )
      );
    };

    await downloadInstanceFiles(
      [...libraries, ...assets, mcMainFile],
      updatePercentage
    );

    await extractNatives(
      libraries,
      path.join(_getInstancesPath(state), instanceName)
    );

    if (assetsJson.map_to_resources) {
      await copyAssetsToResources(assets);
    }
    if (mcJson.assets === "legacy") {
      await copyAssetsToLegacy(assets);
    }

    if (modloader && modloader[0] === "fabric") {
      await dispatch(downloadFabric(instanceName));
    } else if (modloader && modloader[0] === "forge") {
      await dispatch(downloadForge(instanceName));
    } else if (modloader && modloader[0] === "twitchModpack") {
      await dispatch(downloadForge(instanceName));
      await dispatch(downloadForgeManifestFiles(instanceName));
    }

    dispatch(removeDownloadFromQueue(instanceName));
    dispatch(addNextInstanceToCurrentDownload());
  };
}

export const launchInstance = instanceName => {
  return async (dispatch, getState) => {
    const state = getState();
    const javaPath = _getJavaPath(state);
    const account = _getCurrentAccount(state);
    const librariesPath = _getLibrariesPath(state);
    const assetsPath = _getAssetsPath(state);
    const { memory } = state.settings.java;
    const instancePath = path.join(_getInstancesPath(state), instanceName);
    const { modloader } = await fse.readJson(
      path.join(instancePath, "config.json")
    );
    const mcJson = await fse.readJson(
      path.join(_getMinecraftVersionsPath(state), `${modloader[1]}.json`)
    );
    let libraries = [];
    const mcMainFile = {
      url: mcJson.downloads.client.url,
      sha1: mcJson.downloads.client.sha1,
      path: path.join(_getMinecraftVersionsPath(state), `${mcJson.id}.jar`)
    };

    if (modloader && modloader[0] === "fabric") {
      const fabricJsonPath = path.join(
        _getLibrariesPath(state),
        "net",
        "fabricmc",
        modloader[1],
        modloader[2],
        "fabric.json"
      );
      const fabricJson = await fse.readJson(fabricJsonPath);
      const fabricLibraries = librariesMapper(
        fabricJson.libraries,
        librariesPath
      );
      libraries = libraries.concat(fabricLibraries);
      // Replace classname
      mcJson.mainClass = fabricJson.mainClass;
    } else if (
      modloader &&
      (modloader[0] === "forge" || modloader[0] === "twitchModpack")
    ) {
      const forgeJsonPath = path.join(
        _getLibrariesPath(state),
        "net",
        "minecraftforge",
        modloader[2],
        `${modloader[2]}.json`
      );
      const forgeJson = await fse.readJson(forgeJsonPath);
      const forgeLibraries = librariesMapper(
        forgeJson.versionJson.libraries,
        librariesPath
      );
      libraries = libraries.concat(forgeLibraries);
      // Replace classname
      mcJson.mainClass = forgeJson.versionJson.mainClass;
      if (forgeJson.versionJson.minecraftArguments) {
        mcJson.minecraftArguments = forgeJson.versionJson.minecraftArguments;
      } else if (forgeJson.versionJson.arguments.game) {
        mcJson.arguments.game = mcJson.arguments.game.concat(
          forgeJson.versionJson.arguments.game
        );
      }
    }
    libraries = removeDuplicates(
      libraries.concat(librariesMapper(mcJson.libraries, librariesPath)),
      "url"
    );

    const getJvmArguments =
      mcJson.assets !== "legacy" && gte(coerce(mcJson.assets), coerce("1.13"))
        ? getJVMArguments113
        : getJVMArguments112;

    const jvmArguments = await getJvmArguments(
      libraries,
      mcMainFile,
      instancePath,
      assetsPath,
      mcJson,
      account,
      memory
    );

    console.log(`"${javaPath}" ${jvmArguments.join(" ")}`);

    ipcRenderer.send("hide-window");

    const process = spawn(javaPath, jvmArguments, {
      cwd: instancePath,
      shell: true
    });

    process.stdout.on("data", data => {
      console.log(data.toString());
    });

    process.stderr.on("data", data => {
      console.error(`ps stderr: ${data}`);
    });

    process.on("close", code => {
      ipcRenderer.send("show-window");
      if (code !== 0) {
        console.log(`process exited with code ${code}`);
      }
    });
  };
};
