const {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  dialog,
  shell,
  screen,
  globalShortcut,
  nativeImage
} = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const fss = require('fs');
const os = require('os');
const { promisify } = require('util');
const { createHash } = require('crypto');
const {
  default: { fromBase64: toBase64URL }
} = require('base64url');
const { URL } = require('url');
const UserAgent = require('user-agents');
const murmur = require('./native/murmur2');
const nsfw = require('./native/nsfw');

const fs = fss.promises;

let mainWindow;
let tray;
let watcher;

const discordRPC = require('./discordRPC');

const gotTheLock = app.requestSingleInstanceLock();

const isDev = process.env.NODE_ENV === 'development';

// Prevent multiple instances
if (gotTheLock) {
  app.on('second-instance', (e, argv) => {
    if (process.platform === 'win32') {
      const args = process.argv.slice(1);
      const args1 = argv.slice(1);
      log.log([...args, ...args1]);
      if (mainWindow) {
        mainWindow.webContents.send('custom-protocol-event', [
          ...args,
          ...args1
        ]);
      }
    }

    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
} else {
  app.quit();
}

if (!app.isDefaultProtocolClient('gdlauncher')) {
  app.setAsDefaultProtocolClient('gdlauncher');
}

// This gets rid of this: https://github.com/electron/electron/issues/13186
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;
// app.commandLine.appendSwitch("disable-web-security");
app.commandLine.appendSwitch('disable-gpu-vsync=gpu');
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

const edit = [
  ...(process.platform === 'darwin'
    ? [
        {
          label: 'GDLauncher',
          submenu: [
            {
              label: 'About GDLauncher',
              role: 'about'
            },
            { type: 'separator' },
            {
              label: 'Services',
              role: 'services',
              submenu: []
            },
            { type: 'separator' },
            {
              label: 'Hide GDLauncher',
              accelerator: 'Command+H',
              role: 'hide'
            },
            {
              label: 'Hide Others',
              accelerator: 'Command+Alt+H',
              role: 'hideOthers'
            },
            {
              label: 'Show All',
              role: 'unhide'
            },
            { type: 'separator' },
            {
              label: 'Quit GDLauncher',
              accelerator: 'Command+Q',
              click: () => {
                app.quit();
              }
            }
          ]
        }
      ]
    : []),
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        selector: 'cut:'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        selector: 'copy:'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        selector: 'paste:'
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        selector: 'selectAll:'
      },
      { type: 'separator' },
      { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
      { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' }
    ]
  }
];

let navPlatform = null;
switch (os.platform()) {
  case 'win32':
    navPlatform = 'Win32';
    break;
  case 'darwin':
    navPlatform = 'MacIntel';
    break;
  case 'linux':
  default:
    navPlatform = 'Linux x86_64';
}

const userAgent = new UserAgent({
  platform: navPlatform,
  deviceCategory: 'desktop'
}).toString();

// app.allowRendererProcessReuse = true;
Menu.setApplicationMenu(Menu.buildFromTemplate(edit));

let oldLauncherUserData = path.join(app.getPath('userData'), 'instances');

// Read config and eventually use new path
try {
  const configFile = fss.readFileSync(
    path.join(app.getPath('userData'), 'config.json')
  );
  const config = JSON.parse(configFile);
  if (config.settings.instancesPath) {
    oldLauncherUserData = config.settings.instancesPath;
  }
} catch {
  // Do nothing
}

app.setPath('userData', path.join(app.getPath('appData'), 'gdlauncher_next'));

let allowUnstableReleases = false;
const releaseChannelExists = fss.existsSync(
  path.join(app.getPath('userData'), 'rChannel')
);
if (releaseChannelExists) {
  const releaseChannelConfig = fss.readFileSync(
    path.join(app.getPath('userData'), 'rChannel')
  );
  const releaseId = parseInt(releaseChannelConfig.toString(), 10);
  if (releaseId === 1) {
    allowUnstableReleases = true;
  }
} else if (!releaseChannelExists && app.getVersion().includes('beta')) {
  fss.writeFileSync(path.join(app.getPath('userData'), 'rChannel'), '1');
  allowUnstableReleases = true;
}

if (
  process.env.REACT_APP_RELEASE_TYPE === 'portable' &&
  process.platform !== 'linux'
) {
  app.setPath('userData', path.join(path.dirname(app.getPath('exe')), 'data'));
} else {
  const overrideExists = fss.existsSync(
    path.join(app.getPath('userData'), 'override.data')
  );
  if (overrideExists) {
    const override = fss.readFileSync(
      path.join(app.getPath('userData'), 'override.data')
    );
    app.setPath('userData', override.toString());
  }
}

log.log(process.env.REACT_APP_RELEASE_TYPE, app.getVersion());

const get7zPath = async () => {
  let baseDir = path.dirname(app.getPath('exe'));
  if (isDev) {
    baseDir = path.resolve(baseDir, '../../');
    if (process.platform === 'win32') {
      baseDir = path.join(baseDir, '7zip-bin/win/x64');
    } else if (process.platform === 'linux') {
      baseDir = path.join(baseDir, '7zip-bin/linux/x64');
    } else if (process.platform === 'darwin') {
      baseDir = path.resolve(baseDir, '../../../', '7zip-bin/mac/x64');
    }
  }
  if (process.platform === 'linux') {
    return path.join(baseDir, '7za');
  }
  if (process.platform === 'darwin') {
    return path.resolve(baseDir, isDev ? '' : '../', '7za');
  }
  return path.join(baseDir, '7za.exe');
};

async function patchSevenZip() {
  try {
    if (process.platform === 'linux' || process.platform === 'darwin') {
      const sevenZipPath = await get7zPath();
      await promisify(exec)(`chmod +x "${sevenZipPath}"`);
      await promisify(exec)(`chmod 755 "${sevenZipPath}"`);
    }
  } catch (e) {
    log.error(e);
  }
}

patchSevenZip();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    minWidth: 1100,
    minHeight: 700,
    show: true,
    frame: false,
    backgroundColor: '#1B2533',
    webPreferences: {
      experimentalFeatures: true,
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      sandbox: false,
      // Disable in dev since I think hot reload is messing with it
      webSecurity: !isDev
    }
  });

  if (isDev) {
    globalShortcut.register('CommandOrControl+R', () => {
      mainWindow.reload();
    });

    globalShortcut.register('F5', () => {
      mainWindow.reload();
    });
  }

  mainWindow.webContents.session.webRequest.onHeadersReceived(
    {
      urls: ['http://*/*', 'https://*/*']
    },
    (details, callback) => {
      // eslint-disable-next-line
      delete details.responseHeaders['Access-Control-Allow-Origin'];
      // eslint-disable-next-line
      delete details.responseHeaders['access-control-allow-origin'];
      if (details.url.includes('www.google-analytics.com')) {
        // eslint-disable-next-line
        details.responseHeaders['Access-Control-Allow-Origin'] = [
          'http://localhost:3000'
        ];
      } else {
        // eslint-disable-next-line
        details.responseHeaders['Access-Control-Allow-Origin'] = ['*'];
      }
      callback({
        cancel: false,
        responseHeaders: details.responseHeaders
      });
    }
  );

  mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
    (details, callback) => {
      // Use a header to skip sending Origin on request.
      const {
        'X-Skip-Origin': xSkipOrigin,
        Origin: _origin,
        ...requestHeaders
      } = details.requestHeaders;
      if (xSkipOrigin !== 'skip') {
        requestHeaders.Origin = 'https://gdevs.io';
      }
      callback({ cancel: false, requestHeaders });
    }
  );

  const RESOURCE_DIR = isDev ? __dirname : path.join(__dirname, '../build');

  const iconPath = path.join(RESOURCE_DIR, 'logo_32x32.png');

  const nimage = nativeImage.createFromPath(iconPath);

  tray = new Tray(nimage);
  const trayMenuTemplate = [
    {
      label: 'GDLauncher',
      enabled: false
    },
    {
      label: 'Show Dev Tools',
      click: () => mainWindow.webContents.openDevTools()
    }
  ];

  const trayMenu = Menu.buildFromTemplate(trayMenuTemplate);
  tray.setContextMenu(trayMenu);
  tray.setToolTip('GDLauncher');
  tray.on('double-click', () => mainWindow.show());

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`,
    {
      userAgent: 'GDLauncher'
    }
  );
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximized');
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-minimized');
  });

  const handleRedirect = (e, url) => {
    if (url !== mainWindow.webContents.getURL()) {
      e.preventDefault();
      shell.openExternal(url);
    }
  };

  mainWindow.webContents.on('will-navigate', handleRedirect);
  mainWindow.webContents.on('new-window', handleRedirect);
}

app.on('ready', createWindow);

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
  if (mainWindow) {
    mainWindow.removeAllListeners('close');
  }
  mainWindow = null;
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.handle(
  'msLoginOAuth',
  (_event, clientId, codeVerifier, redirectUrl) =>
    new Promise((resolve, reject) => {
      const codeChallenge = toBase64URL(
        createHash('sha256').update(codeVerifier).digest('base64')
      );

      const msAuthorizeUrl = new URL(
        'https://login.live.com/oauth20_authorize.srf'
      );
      msAuthorizeUrl.searchParams.set('client_id', clientId);
      msAuthorizeUrl.searchParams.set('redirect_uri', redirectUrl);
      msAuthorizeUrl.searchParams.set('code_challenge', codeChallenge);
      msAuthorizeUrl.searchParams.set('code_challenge_method', 'S256');
      msAuthorizeUrl.searchParams.set('response_type', 'code');
      msAuthorizeUrl.searchParams.set(
        'scope',
        'offline_access xboxlive.signin xboxlive.offline_access'
      );
      msAuthorizeUrl.searchParams.set(
        'cobrandid',
        '8058f65d-ce06-4c30-9559-473c9275a65d'
      );

      const handleRedirect = (url, authWindow) => {
        const rdUrl = new URL(url);
        const orUrl = new URL(redirectUrl);

        if (
          rdUrl.origin === orUrl.origin &&
          rdUrl.pathname === orUrl.pathname
        ) {
          const redirectCode = rdUrl.searchParams.get('code');
          const redirectError = rdUrl.searchParams.get('error');

          authWindow.destroy(); // Will not trigger 'close'

          if (redirectCode) {
            return resolve(redirectCode);
          }
          return reject(redirectError);
        }
      };

      const oAuthWindow = new BrowserWindow({
        title: 'Sign in to your Microsoft account',
        show: false,
        parent: mainWindow,
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: false
        }
      });

      oAuthWindow.webContents.session.clearStorageData();

      // Remove Origin
      oAuthWindow.webContents.session.webRequest.onBeforeSendHeaders(
        (details, callback) => {
          const {
            requestHeaders: { Origin, ...requestHeaders }
          } = details;
          callback({ cancel: false, requestHeaders });
        }
      );

      oAuthWindow.on('close', () =>
        reject(new Error('User closed login window'))
      );

      oAuthWindow.webContents.on('will-navigate', (_e, url) =>
        handleRedirect(url, oAuthWindow)
      );

      oAuthWindow.webContents.on('will-redirect', (_e, url) =>
        handleRedirect(url, oAuthWindow)
      );

      oAuthWindow.show();
      return oAuthWindow
        .loadURL(msAuthorizeUrl.toString())
        .catch(error => reject(error));
    })
);

ipcMain.handle('update-progress-bar', (event, p) => {
  mainWindow.setProgressBar(p / 100);
});

ipcMain.handle('hide-window', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

ipcMain.handle('min-max-window', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.handle('minimize-window', () => {
  mainWindow.minimize();
});

ipcMain.handle('show-window', () => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
});

ipcMain.handle('quit-app', async () => {
  if (watcher) {
    log.log('Stopping listener');
    await watcher.stop();
    watcher = null;
  }
  mainWindow.close();
  mainWindow = null;
});

ipcMain.handle('isAppImage', () => {
  return process.env.APPIMAGE;
});

ipcMain.handle('getAppdataPath', () => {
  return app.getPath('appData');
});

// Returns path to app.asar
ipcMain.handle('getAppPath', () => {
  return app.getAppPath();
});

ipcMain.handle('getUserData', () => {
  return app.getPath('userData');
});

ipcMain.handle('getSentryDsn', () => {
  return process.env.SENTRY_DSN;
});

ipcMain.handle('getOldLauncherUserData', () => {
  return oldLauncherUserData;
});

ipcMain.handle('getExecutablePath', () => {
  return path.dirname(app.getPath('exe'));
});

ipcMain.handle('getAppVersion', () => {
  return app.getVersion();
});

ipcMain.handle('getIsWindowMaximized', () => {
  return !mainWindow.maximizable;
});

ipcMain.handle('openFolder', (e, folderPath) => {
  shell.openPath(folderPath);
});

ipcMain.handle('open-devtools', () => {
  mainWindow.webContents.openDevTools({ mode: 'undocked' });
});

ipcMain.handle('openFolderDialog', (e, defaultPath) => {
  return dialog.showOpenDialog({
    properties: ['openDirectory'],
    defaultPath: path.dirname(defaultPath)
  });
});

ipcMain.handle('openFileDialog', (e, filters) => {
  return dialog.showOpenDialog({
    properties: ['openFile'],
    filters
  });
});

ipcMain.handle('appRestart', async () => {
  log.log('Restarting app');
  if (watcher) {
    log.log('Stopping listener');
    await watcher.stop();
    watcher = null;
  }
  app.relaunch();
  mainWindow.close();
});

ipcMain.handle('getAllDisplaysBounds', () => {
  return screen.getAllDisplays().map(v => v.bounds);
});

ipcMain.handle('init-discord-rpc', () => {
  discordRPC.initRPC();
});

ipcMain.handle('update-discord-rpc', (event, p) => {
  discordRPC.update(p);
});

ipcMain.handle('reset-discord-rpc', () => {
  discordRPC.reset();
});

ipcMain.handle('shutdown-discord-rpc', () => {
  discordRPC.shutdownRPC();
});

ipcMain.handle('download-optedout-mod', async (e, { url, filePath }) => {
  let win = new BrowserWindow();

  const mainWindowListener = () => {
    if (win) {
      win.removeAllListeners();
      win.close();
      win = null;
    }
  };

  win.once('close', () => {
    win = null;
  });

  let cleanupFn = null;
  win.once('closed', () => {
    mainWindow.webContents.send('opted-out-window-closed-unexpected');
    if (cleanupFn) cleanupFn(`Window has been closed unexpectedly`);
    mainWindow.removeListener('closed', mainWindowListener);
  });

  mainWindow.on('closed', mainWindowListener);

  if (!win) return;
  try {
    // eslint-disable-next-line no-loop-func
    await new Promise((resolve, reject) => {
      win.webContents.session.webRequest.onCompleted(
        { urls: [url] },
        details => {
          if (details.statusCode === 404) {
            mainWindow.webContents.send('opted-out-download-mod-status', {
              error: new Error('Error 404, Mod page not found')
            });
            reject();
          }
        }
      );

      win.loadURL(url, { userAgent });
      cleanupFn = async err => {
        reject(new Error(err));
        // eslint-disable-next-line promise/param-names
        await new Promise(r => setTimeout(r, 50));
        mainWindowListener();
      };
      const timer = setTimeout(
        () => cleanupFn(`Download for ${url} timed out`),
        60 * 1000 * 2
      );
      win.webContents.session.once('will-download', (_, item) => {
        item.setSavePath(filePath);

        item.once('updated', () => {
          clearTimeout(timer);
        });

        item.once('done', (event, state) => {
          if (state === 'completed') {
            resolve();
          } else {
            reject(new Error(`Download for ${url} failed`));
          }
        });
      });
    });
    if (mainWindow?.webContents) {
      // send success event to front end
      mainWindow.webContents.send('opted-out-download-mod-status', {
        error: false
      });
    }
  } catch (err) {
    if (mainWindow?.webContents && win) {
      // send error event to front end
      mainWindow.webContents.send('opted-out-download-mod-status', {
        error: err
      });
    }
  }

  if (win) {
    win.removeAllListeners();
    win.close();
    win.once('closed', () => {
      win = null;
    });
  }
});

ipcMain.handle('download-optedout-mods', async (e, { mods, instancePath }) => {
  let win = new BrowserWindow();

  const mainWindowListener = () => {
    if (win) {
      win.removeAllListeners();
      win.close();
      win = null;
    }
  };

  win.once('close', () => {
    win = null;
  });

  let cleanupFn = null;
  win.once('closed', () => {
    mainWindow.webContents.send('opted-out-window-closed-unexpected');
    if (cleanupFn) cleanupFn(`Window has been closed unexpectedly`);
    mainWindow.removeListener('closed', mainWindowListener);
  });

  mainWindow.on('closed', mainWindowListener);
  for (const mod of mods) {
    if (!win) return;
    const { modManifest, addon } = mod;
    try {
      // eslint-disable-next-line no-loop-func
      await new Promise((resolve, reject) => {
        const urlDownloadPage = `${addon.links.websiteUrl}/download/${modManifest.id}`;

        win.webContents.session.webRequest.onCompleted(
          { urls: [urlDownloadPage] },
          details => {
            if (details.statusCode === 404) {
              resolve();
              mainWindow.webContents.send('opted-out-download-mod-status', {
                modId: modManifest.id,
                error: false,
                warning: true
              });
            }
          }
        );

        win.loadURL(urlDownloadPage, { userAgent });
        cleanupFn = async err => {
          reject(new Error(err));
          // eslint-disable-next-line promise/param-names
          await new Promise(r => setTimeout(r, 50));
          mainWindowListener();
        };
        const timer = setTimeout(
          () => cleanupFn(`Download for ${modManifest.fileName} timed out`),
          60 * 1000 * 2
        );

        const isResourcePack = addon.classId === 12;

        const modDestFile = path.join(
          instancePath,
          isResourcePack ? 'resourcepacks' : 'mods'
        );

        win.webContents.session.once('will-download', (_, item) => {
          item.setSavePath(path.join(modDestFile, modManifest.fileName));

          item.once('updated', () => {
            clearTimeout(timer);
          });

          item.once('done', (event, state) => {
            if (state === 'completed') {
              resolve();
            } else {
              reject(new Error(`Download for ${modManifest.fileName} failed`));
            }
          });
        });
      });
      if (mainWindow?.webContents) {
        // send success event to front end
        mainWindow.webContents.send('opted-out-download-mod-status', {
          modId: modManifest.id,
          error: false
        });
      }
    } catch (err) {
      if (mainWindow?.webContents && win) {
        // send error event to front end
        mainWindow.webContents.send('opted-out-download-mod-status', {
          modId: modManifest.id,
          error: err
        });
      }
    }
  }

  if (win) {
    win.removeAllListeners();
    win.close();
    win.once('closed', () => {
      win = null;
    });
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

// AutoUpdater

if (process.env.REACT_APP_RELEASE_TYPE === 'setup') {
  autoUpdater.autoDownload = false;
  autoUpdater.allowDowngrade =
    !allowUnstableReleases && app.getVersion().includes('beta');
  autoUpdater.allowPrerelease = allowUnstableReleases;
  autoUpdater.setFeedURL({
    owner: 'gorilla-devs',
    repo: 'GDLauncher',
    provider: 'github'
  });

  autoUpdater.on('update-available', () => {
    autoUpdater.downloadUpdate();
  });

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('updateAvailable');
  });

  ipcMain.handle('checkForUpdates', () => {
    autoUpdater.checkForUpdates();
  });
}

ipcMain.handle('installUpdateAndQuitOrRestart', async (e, quitAfterInstall) => {
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
