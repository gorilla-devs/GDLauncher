import path from 'path';
import { app } from 'electron';
import fs from 'fs';
import { spawn } from 'child_process';
import { autoUpdater } from 'electron-updater';
import { mainWindow } from '../windows';
import { addListener } from '../messageListener';
import EV from '../../../common/messageEvents';

const applyUpdate = async (e, quitAfterInstall) => {
  if (process.env.REACT_APP_RELEASE_TYPE === 'setup') {
    autoUpdater.quitAndInstall(true, !quitAfterInstall);
  } else {
    const tempFolder = path.join(
      path.dirname(app.getPath('exe')),
      'data',
      'temp'
    );
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
};

addListener(EV.APPLY_UPDATE, applyUpdate);
