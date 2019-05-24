/* eslint global-require: 0, flowtype-errors/show-errors: 0 */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, BrowserWindow, ipcMain } from 'electron';
import minimist from 'minimist';
import log from 'electron-log';
import DiscordRPC from 'discord-rpc';
import { autoUpdater } from 'electron-updater';
import store from './localStore';
import { THEMES } from './constants';
import MenuBuilder from './menu';
import cli from './utils/cli';

// This gets rid of this: https://github.com/electron/electron/issues/13186
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

let mainWindow = null;
let splash = null;
log.info(`Config store: ${store.path}`);
const settings = store.get('settings') ? store.get('settings').theme : THEMES;
const primaryColor =
  settings && settings.primary ? settings.primary : '#2c3e50';
const secondaryColor =
  settings && settings['secondary-color-1']
    ? settings['secondary-color-1']
    : '#34495e';

if (minimist(process.argv.slice(1)).i) {
  cli(process.argv, () => app.quit());
} else {
  if (process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
  }

  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    require('electron-debug')({ enabled: true });
  }

  const installExtensions = async () => {
    const installer = require('electron-devtools-installer');
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

    return Promise.all(
      extensions.map(name => installer.default(installer[name], forceDownload))
    ).catch(log.error);
  };

  /**
   * Add event listeners...
   */

  app.on('window-all-closed', () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    app.quit();
  });

  app.on('ready', async () => {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      await installExtensions();
    }

    // create a new `splash`-WindowF
    splash = new BrowserWindow({
      show: true,
      width: 850,
      height: 730,
      frame: false,
      backgroundColor: secondaryColor,
      resizable: false,
      webPreferences: {
        nodeIntegration: true
      }
    });
    splash.colors = {
      primaryColor,
      secondaryColor
    };
    splash.loadURL(`file://${__dirname}/splash.html`);

    mainWindow = new BrowserWindow({
      show: false,
      width: 930,
      height: 710,
      minHeight: 600,
      minWidth: 900,
      frame: false,
      backgroundColor: secondaryColor,
      webPreferences: {
        experimentalFeatures: true,
        nodeIntegration: true
      }
    });

    mainWindow.webContents.on('new-window', (e, url) => {
      e.preventDefault();
      require('electron').shell.openExternal(url);
    });

    mainWindow.webContents.on('will-navigate', (e, url) => {
      if (
        process.env.NODE_ENV !== 'development' &&
        process.env.DEBUG_PROD !== 'true'
      ) {
        e.preventDefault();
        require('electron').shell.openExternal(url);
      }
    });

    mainWindow.loadURL(`file://${__dirname}/app.html`, {
      userAgent: 'GDLauncher'
    });

    // @TODO: Use 'ready-to-show' event
    //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
    mainWindow.webContents.on('did-finish-load', () => {
      if (!mainWindow) {
        throw new Error('"mainWindow" is not defined');
      }
      splash.destroy();


      // Sets the DISCORD-RPC
      const clientId = '555898932467597312';
      let rpc = new DiscordRPC.Client({ transport: 'ipc' });
      rpc.once('ready', () => {
        rpc.setActivity({
          details: `Becoming a Gorilla`,
          state: 'Grrrrrrrr',
          startTimestamp: Math.floor(Date.now() / 1000),
          largeImageKey: 'default_big',
          largeImageText: 'GDLauncher - A Custom Minecraft Launcher',
          instance: false,
        });
      });
      rpc.login({ clientId }).catch(log.error);

      autoUpdater.logger = log;
      autoUpdater.autoDownload = false;

      const channel =
        store.get('settings') &&
          (store.get('settings').releaseChannel === 'latest' ||
            store.get('settings').releaseChannel === 'beta')
          ? store.get('settings').releaseChannel
          : 'latest';

      autoUpdater.channel = channel;

      autoUpdater.allowPrerelease = channel === 'beta';

      // Same as for console transport
      log.transports.file.level = 'silly';
      log.transports.file.format = '{h}:{i}:{s}:{ms} {text}';

      // Set approximate maximum log size in bytes. When it exceeds,
      // the archived log will be saved as the log.old.log file
      log.transports.file.maxSize = 5 * 1024 * 1024;

      // fs.createWriteStream options, must be set before first logging
      // you can find more information at
      // https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options
      log.transports.file.streamConfig = { flags: 'w' };

      mainWindow.show();
      mainWindow.focus();
    });
    let checked = false;

    ipcMain.on('check-for-updates', ev => {
      // Avoid doing this more than 1 time. It breaks everything
      if (checked === true) return;
      autoUpdater.checkForUpdates();
      checked = true;
      log.info('CHECK_FOR_UPDATES');

      autoUpdater.on('update-available', info => {
        log.info('DOWNLOAD_AVAILABLE');
        ev.sender.send('update-available');
      });

      autoUpdater.on('update-downloaded', info => {
        log.info('UPDATE_DOWNLOADED');
        ev.sender.send('update-downloaded');
      });

      autoUpdater.on('download-progress', data => {
        log.info(data);
        ev.sender.send('download-progress', Math.floor(data.percent));
      });
    });

    ipcMain.on('download-updates', () => {
      log.info('DOWNLOAD_UPDATES');
      autoUpdater.downloadUpdate();
    });

    ipcMain.on('apply-updates', () => {
      log.info('APPLY_UPDATES');
      autoUpdater.quitAndInstall(true, true);
      // app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) });
      // app.exit();
    });

    ipcMain.on('open-devTools', () => {
      mainWindow.webContents.openDevTools({ mode: 'undocked' });
    });

    ipcMain.on('setProgressTaskBar', p => {
      mainWindow.setProgressBar(p);
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    const menuBuilder = new MenuBuilder(mainWindow);
    menuBuilder.buildMenu();
  });
}