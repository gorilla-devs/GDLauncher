import { app } from 'electron';
import path from 'path';
import log from 'electron-log';
import EV from '../common/messageEvents';

const handleUserDataPath = require('./src/handleUserDataPath').default;

handleUserDataPath();

const handleKeybinds = require('./src/handleKeybinds').default;
const { mainWindow, createMainWindow } = require('./src/windows');
const extractSevenZip = require('./src/fix7zPermissions').default;
const {
  listenMessage,
  registerListeners,
  sendMessage
} = require('./src/messageListener');
const initializeAutoUpdater = require('./src/autoUpdater').default;
const initializeInstances = require('./src/instancesHandler').default;
const generateMessageId = require('../common/utils/generateMessageId').default;
const initializeManifests = require('./src/manifests').default;
const { USERDATA_PATH } = require('./src/config');

log.transports.file.level = 'silly';
log.transports.console.level = true;
log.transports.file.maxSize = 900 * 1024; // 900KB
log.transports.file.resolvePath = variables => {
  return path.join(USERDATA_PATH, variables.fileName);
};

// eslint-disable-next-line
import './src/handleGlobalCrash';

// handleUserDataPath();

// Prevent multiple instances
app.allowRendererProcessReuse = false;
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

// This gets rid of this: https://github.com/electron/electron/issues/13186
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;
app.commandLine.appendSwitch('disable-gpu-vsync=gpu');
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

log.log(process.env.REACT_APP_RELEASE_TYPE, app.getVersion());

app.on('ready', () => {
  const window = createMainWindow();

  window.on('maximize', () => {
    sendMessage(EV.MAIN_WINDOW_MAXIMIZED, generateMessageId());
  });

  window.on('unmaximize', () => {
    sendMessage(EV.MAIN_WINDOW_MINIMIZED, generateMessageId());
  });

  registerListeners();
  listenMessage();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  mainWindow.removeAllListeners('close');
});

app.on('second-instance', () => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on('activate', () => {
  if (!mainWindow) {
    createMainWindow();
  }
});

handleKeybinds();
extractSevenZip();
initializeAutoUpdater().catch(log.error);
initializeInstances().catch(log.error);
initializeManifests().catch(log.error);
