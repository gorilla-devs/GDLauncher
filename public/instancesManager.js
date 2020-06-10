const { spawn } = require('child_process');
const path = require('path');
const fse = require('fs-extra');
const { omit } = require('lodash');

class InstancesManager {
  constructor(instancesPath, mainWindow, createWindow) {
    this.startedInstances = {};
    this.instancesPath = instancesPath;
    this.mainWindow = mainWindow;
    this.createWindow = createWindow;
  }

  _updateMainWindow(mainWindow) {
    this.mainWindow = mainWindow;
  }

  _updateInstance(pid, data) {
    if (data) {
      this.startedInstances[pid] = data;
    } else {
      this.startedInstances = omit(this.startedInstances, [pid]);
    }
  }

  initializeInstance(
    instanceName,
    javaPath,
    jvmArguments,
    instanceJLFPath,
    symLinkDirPath
  ) {
    const ps = spawn(javaPath, jvmArguments, {
      cwd: path.join(this.instancesPath, instanceName),
      shell: true
    });

    this._updateInstance(ps.pid, { instanceName, playedTime: 0 });

    const playTimer = setInterval(async () => {
      if (!this.mainWindow) {
        const prev = await fse.readJSON(
          path.join(this.instancesPath, instanceName, 'config.json')
        );
        await fse.writeJSON(
          path.join(this.instancesPath, instanceName, 'config.json'),
          {
            ...prev,
            timePlayed: (Number(prev.timePlayed) || 0) + 1
          }
        );
      } else {
        this.mainWindow.webContents.send(
          'update-instance-config',
          instanceName,
          prev => ({
            ...prev,
            timePlayed: (Number(prev.timePlayed) || 0) + 1
          })
        );
      }
    }, 60 * 1000);

    ps.on('close', () => {
      clearInterval(playTimer);
      if (!ps.killed) {
        ps.kill();
      }
      fse.remove(instanceJLFPath);
      if (process.platform === 'win32') fse.remove(symLinkDirPath);
      this._updateInstance(ps.pid, null);
      if (Object.keys(this.startedInstances).length === 0) {
        if (this.mainWindow) {
          this.mainWindow.webContents.send('instanceStopped', instanceName);
          this.mainWindow.show();
          this.mainWindow.focus();
        } else {
          this.mainWindow = this.createWindow(this.startedInstances);
          this.mainWindow.show();
          this.mainWindow.focus();
        }
      }
    });

    return ps;
  }
}

module.exports = {
  default: InstancesManager
};
