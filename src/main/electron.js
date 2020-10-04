import { app, ipcMain } from 'electron';
import log from 'electron-log';
import handleKeybinds from './src/handleKeybinds';
import { createWindow, mainWindow } from './src/mainWindow';
import extractSevenZip from './src/extractSevenZip';
import { listenMessage, registerListeners } from './src/messageListener';
import handleUserDataPath from './src/handleUserDataPath';
import initializeAutoUpdater from './src/autoUpdater';

log.transports.file.level = 'silly';
log.transports.console.level = true;
log.transports.file.maxSize = 900 * 1024; // 900KB

// eslint-disable-next-line
import './src/handleGlobalCrash';

const murmur = require('murmur2-calculator');
const nsfw = require('nsfw');

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

handleUserDataPath();
handleKeybinds();

// This gets rid of this: https://github.com/electron/electron/issues/13186
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;
app.commandLine.appendSwitch('disable-gpu-vsync=gpu');
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

log.log(process.env.REACT_APP_RELEASE_TYPE, app.getVersion());

extractSevenZip();
let watcher;

app.on('ready', () => {
  createWindow();
  registerListeners();
  listenMessage();
});

app.on('window-all-closed', () => {
  if (watcher) {
    watcher.stop();
    watcher = null;
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  if (watcher) {
    await watcher.stop();
    watcher = null;
  }
  mainWindow.removeAllListeners('close');
  mainWindow = null;
});

app.on('second-instance', () => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.handle('start-listener', async (e, dirPath) => {
  try {
    log.log('Trying to start listener');
    if (watcher) {
      await watcher.stop();
      watcher = null;
    }
    watcher = await nsfw(dirPath, events => {
      log.log(`Detected ${events.length} events from listener`);
      mainWindow.webContents.send('listener-events', events);
    });
    log.log('Started listener');
    return watcher.start();
  } catch (err) {
    log.error(err);
    return Promise.reject(err);
  }
});

ipcMain.handle('stop-listener', async () => {
  if (watcher) {
    log.log('Stopping listener');
    await watcher.stop();
    watcher = null;
  }
});

ipcMain.handle('calculateMurmur2FromPath', (e, filePath) => {
  return new Promise((resolve, reject) => {
    return murmur(filePath).then(v => {
      if (v.toString().length === 0) reject();
      return resolve(v);
    });
  });
});

initializeAutoUpdater();
