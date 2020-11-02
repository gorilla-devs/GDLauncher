import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import to from 'await-to-js';
import originalFs from 'original-fs';
import { promises as fs } from 'fs';
import axios from 'axios';
import { pipeline } from 'stream';
import zlib from 'zlib';
import path from 'path';
import makeDir from 'make-dir';
import { app } from 'electron';
import pMap from 'p-map';
import { lt, parse } from 'semver';
import { sendMessage } from './messageListener';
import EV from '../../common/messageEvents';
import generateMessageId from '../../common/utils/generateMessageId';
import { DB_INSTANCE, TEMP_PATH } from './config';
import { getFileHash, getFilesRecursive } from './helpers';

const autoUpdateRepo = {
  owner: 'gorilla-devs',
  repo: 'GDLauncher-Test-Releases',
  provider: 'github'
};

export default async function initializeAutoUpdater() {
  const [, allowUnstableReleases] = await to(
    DB_INSTANCE.get('allowUnstableReleases')
  );

  if (process.env.REACT_APP_RELEASE_TYPE === 'setup') {
    autoUpdater.autoDownload = true;
    autoUpdater.allowDowngrade = !allowUnstableReleases;
    autoUpdater.allowPrerelease = allowUnstableReleases;
    autoUpdater.setFeedURL(autoUpdateRepo);
    autoUpdater.on('update-downloaded', async () => {
      log.log('[SETUP] Update ready!');
      sendMessage(EV.UPDATE_AVAILABLE, generateMessageId());
    });
  }

  setInterval(() => checkForUpdates(allowUnstableReleases), 1000 * 60 * 30);
}

const checkForUpdates = async allowUnstableReleases => {
  if (process.env.REACT_APP_RELEASE_TYPE === 'setup') {
    try {
      log.log('[SETUP] Checking for updates...');
      const updateFound = await autoUpdater.checkForUpdates();
      log.log(`[SETUP] ${updateFound ? 'Update found' : 'Update not found'}`);
    } catch (err) {
      log.error(err);
    }
  } else {
    let isNewUpdateAvailable;
    try {
      log.log('[PORTABLE] Checking for updates...');
      isNewUpdateAvailable = await checkForPortableUpdate(
        allowUnstableReleases
      );
      log.log(
        `[PORTABLE] ${
          isNewUpdateAvailable ? 'Update found' : 'Update not found'
        }`
      );
    } catch (err) {
      log.error(err);
    }

    if (isNewUpdateAvailable) {
      if (
        process.platform !== 'win32' ||
        process.env.REACT_APP_RELEASE_TYPE !== 'portable'
      ) {
        sendMessage(EV.UPDATE_AVAILABLE, generateMessageId());
        return isNewUpdateAvailable;
      }
      try {
        await downloadPortableUpdate(isNewUpdateAvailable);
        sendMessage(EV.UPDATE_AVAILABLE, generateMessageId());
      } catch (err) {
        log.error(err);
      }
    }
  }
};

const downloadPortableUpdate = async latestVersion => {
  const baseAssetUrl = `https://github.com/${autoUpdateRepo.owner}/${autoUpdateRepo.repo}/releases/download/${latestVersion?.tag_name}`;
  const { data: latestManifest } = await axios.get(
    `${baseAssetUrl}/${process.platform}_latest.json`
  );
  const tempFolder = path.join(TEMP_PATH, `update`);
  // Cleanup all files that are not required for the update
  await makeDir(tempFolder);

  const filesToUpdate = (
    await Promise.all(
      latestManifest.map(async file => {
        const fileOnDisk = path.join(
          path.dirname(app.getPath('exe')),
          ...file.file
        );
        let needsDownload = false;
        try {
          // Check if files exists
          await originalFs.promises.stat(fileOnDisk);

          const fileOnDiskSha1 = await getFileHash(fileOnDisk);

          if (fileOnDiskSha1.toString() !== file.sha1) {
            throw new Error('SHA1 Mismatch', file.compressedFile);
          }
        } catch (err) {
          needsDownload = true;
        }
        if (needsDownload) {
          return file;
        }
        return null;
      })
    )
  ).filter(_ => _);

  const tempFiles = await getFilesRecursive(tempFolder);
  await Promise.all(
    tempFiles.map(async tempFile => {
      const tempFileRelativePath = path.relative(tempFolder, tempFile);
      const isNeeded = filesToUpdate.find(
        v => path.join(...v.file) === tempFileRelativePath
      );
      if (!isNeeded) {
        await fs.unlink(tempFile);
      }
    })
  );

  await pMap(
    filesToUpdate,
    async file => {
      const compressedFile = path.join(tempFolder, file.compressedFile);
      const destinationPath = path.join(tempFolder, ...file.file);
      try {
        // Check if files exists
        await originalFs.promises.access(destinationPath);
        const fileSha1 = await getFileHash(destinationPath);
        if (fileSha1.toString() !== file.sha1) {
          throw new Error('SHA1 mismatch', file.compressedFile);
        }
      } catch {
        try {
          try {
            await originalFs.promises.access(compressedFile);
            const fileSha1 = await getFileHash(compressedFile);
            if (fileSha1.toString() === file.sha1) {
              return;
            }
          } catch {
            // Nothing, just go ahead and download since sha1 mismatch
          }

          // Try to download 5 times
          const maxTries = 5;
          let sha1Matched = false;
          while (maxTries <= 5 && !sha1Matched) {
            // eslint-disable-next-line
            await downloadFile(
              compressedFile,
              `${baseAssetUrl}/${file.compressedFile}`
            );
            // eslint-disable-next-line
            const fileSha1 = await getFileHash(compressedFile);
            if (fileSha1.toString() === file.compressedSha1) {
              sha1Matched = true;
            }
          }

          if (!sha1Matched) {
            throw new Error(`Could not download ${file.compressedSha1}`);
          }

          const gzip = zlib.createGunzip();
          const source = originalFs.createReadStream(compressedFile);

          await makeDir(path.dirname(destinationPath));
          const destination = originalFs.createWriteStream(destinationPath);

          await new Promise((resolve, reject) => {
            pipeline(source, gzip, destination, err => {
              if (err) {
                reject(err);
              }
              resolve();
            });
          });

          await fs.unlink(compressedFile);
        } catch (err) {
          throw new Error(err);
        }
      }
    },
    { concurrency: 3 }
  );
  return latestVersion;
};

const checkForPortableUpdate = async allowUnstableReleases => {
  // Fetch latest version from github APIs
  const { data: latestReleases } = await axios.get(
    `https://api.github.com/repos/${autoUpdateRepo.owner}/${autoUpdateRepo.repo}/releases`
  );
  const appVersion = app.getVersion();
  const isCurrentVersionBeta = appVersion.includes('beta');
  const latestPrerelease = latestReleases.find(v => v.prerelease);
  const latestStablerelease = latestReleases.find(v => !v.prerelease);

  const isAppUpdated = r => !lt(parse(appVersion), parse(r.tag_name));

  // If we're on beta but the release channel is stable, return latest stable to force an update
  if (isCurrentVersionBeta && !allowUnstableReleases) {
    return latestStablerelease;
  }
  if (!isAppUpdated(latestStablerelease)) {
    return latestStablerelease;
  }
  if (!isAppUpdated(latestPrerelease) && allowUnstableReleases) {
    return latestPrerelease;
  }

  return false;
};
