import path from 'path';
import { app } from 'electron';
import fs from 'fs';
import { spawn } from 'child_process';
import { autoUpdater } from 'electron-updater';
import { mainWindow } from './windows';
import { addListener, sendMessage } from './messageListener';
import EV from '../../common/messageEvents';
import generateMessageId from '../../common/utils/generateMessageId';

export default function initializeAutoUpdater() {
  let allowUnstableReleases = false;
  const releaseChannelExists = fs.existsSync(
    path.join(app.getPath('userData'), 'rChannel')
  );
  if (releaseChannelExists) {
    const releaseChannelConfig = fs.readFileSync(
      path.join(app.getPath('userData'), 'rChannel')
    );
    const releaseId = parseInt(releaseChannelConfig.toString(), 10);
    if (releaseId === 1) {
      allowUnstableReleases = true;
    }
  }

  if (process.env.REACT_APP_RELEASE_TYPE === 'setup') {
    autoUpdater.autoDownload = false;
    autoUpdater.allowDowngrade = !allowUnstableReleases;
    autoUpdater.allowPrerelease = allowUnstableReleases;
    autoUpdater.setFeedURL({
      owner: 'gorilla-devs',
      repo: 'GDLauncher',
      provider: 'github'
    });

    autoUpdater.on('update-available', () => {
      autoUpdater.downloadUpdate();
    });

    autoUpdater.on('update-downloaded', async () => {
      sendMessage(EV.UPDATE_AVAILABLE, generateMessageId());
    });

    addListener(EV.CHECK_FOR_UPDATES, async () => {
      autoUpdater.checkForUpdates();
    });
  }

  addListener(EV.APPLY_UPDATE, async (e, quitAfterInstall) => {
    const tempFolder = path.join(
      path.dirname(app.getPath('exe')),
      'data',
      'temp'
    );
    if (process.env.REACT_APP_RELEASE_TYPE === 'setup') {
      autoUpdater.quitAndInstall(true, !quitAfterInstall);
    } else {
      const updaterVbs = 'updater.vbs';
      const updaterBat = 'updateLauncher.bat';
      await fs.writeFile(
        path.join(tempFolder, updaterBat),
        `ping 127.0.0.1 -n 1 > nul & robocopy "${path.join(
          tempFolder,
          'update'
        )}" "." /MOV /E${
          quitAfterInstall ? '' : ` & start "" "${app.getPath('exe')}"`
        }
                                DEL "${path.join(tempFolder, updaterVbs)}"
                                DEL "%~f0"
                                `
      );

      await fs.writeFile(
        path.join(tempFolder, updaterVbs),
        `Set WshShell = CreateObject("WScript.Shell") 
                                    WshShell.Run chr(34) & "${path.join(
                                      tempFolder,
                                      updaterBat
                                    )}" & Chr(34), 0
                                        Set WshShell = Nothing
                                        `
      );

      const updateSpawn = spawn(path.join(tempFolder, updaterVbs), {
        cwd: path.dirname(app.getPath('exe')),
        detached: true,
        shell: true,
        stdio: [
          'ignore' /* stdin */,
          'ignore' /* stdout */,
          'ignore' /* stderr */
        ]
      });
      updateSpawn.unref();
      mainWindow.close();
    }
  });
}
