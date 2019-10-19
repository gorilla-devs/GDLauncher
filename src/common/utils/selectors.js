import { createSelector } from "reselect";
import { remote } from "electron";
import os from "os";
import path from "path";
import memoize from "lodash.memoize";
import { convertOSToMCFormat } from "../../app/desktop/utils";

const _instances = state => state.instances;
const _accounts = state => state.app.accounts;
const _currentAccountId = state => state.app.currentAccountId;
const _currentDownload = state => state.currentDownload;
const _downloadQueue = state => state.downloadQueue;
const _launcherManifest = state => state.app.launcherManifest;

export const _getInstance = createSelector(
  _instances,
  instances => memoize(instance => instances.find(v => v.name === instance))
);

export const _getCurrentAccount = createSelector(
  _accounts,
  _currentAccountId,
  (accounts, currentAccountId) =>
    accounts.find(account => account.selectedProfile.id === currentAccountId)
);

export const _getCurrentDownloadItem = createSelector(
  _currentDownload,
  _downloadQueue,
  (currentDownload, downloadQueue) => {
    return downloadQueue[currentDownload];
  }
);

export const _getJavaPath = createSelector(
  _launcherManifest,
  launcherManifest => {
    const mcOs = convertOSToMCFormat(os.type());
    const { version } = launcherManifest[mcOs][64].jre;
    const filename = process.platform === "win32" ? "java.exe" : "java";
    return path.join(
      remote.app.getPath("userData"),
      "java",
      version,
      "bin",
      filename
    );
  }
);
