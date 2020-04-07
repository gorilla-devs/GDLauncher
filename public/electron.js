const {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  dialog,
  shell,
  screen,
  globalShortcut
} = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const { autoUpdater } = require('electron-updater');
const nsfw = require('nsfw');
const murmur = require('murmur2-calculator');
const Store = require('electron-store');
const fs = require('fs').promises;

const discordRPC = require('./discordRPC');

// This gets rid of this: https://github.com/electron/electron/issues/13186
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;
// app.commandLine.appendSwitch("disable-web-security");
app.commandLine.appendSwitch('disable-gpu-vsync=gpu');
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
// app.allowRendererProcessReuse = true;
Menu.setApplicationMenu();

if (process.env.REACT_APP_RELEASE_TYPE === 'portable') {
  app.setPath('userData', path.join(path.dirname(app.getPath('exe')), 'data'));
} else {
  // this defaults to app.getPath('userData'), which is fine since we only use it for setup
  const store = new Store();
  if (store.has('userDataOverride')) {
    app.setPath('userData', store.get('userDataOverride'));
  }
}

console.log(process.env.REACT_APP_RELEASE_TYPE);

const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let tray;
let watcher;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    minWidth: 1100,
    minHeight: 700,
    show: true,
    frame: false,
    backgroundColor: '#353E48',
    webPreferences: {
      experimentalFeatures: true,
      nodeIntegration: true,
      // Disable in dev since I think hot reload is messing with it
      webSecurity: !isDev
    }
  });

  globalShortcut.register('CommandOrControl+R', () => {
    mainWindow.reload();
  });

  globalShortcut.register('F5', () => {
    mainWindow.reload();
  });

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

  tray = new Tray(
    isDev
      ? path.join(__dirname, './icon.png')
      : path.join(__dirname, '../build/icon.png')
  );
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

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

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
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.handle('update-progress-bar', (event, p) => {
  mainWindow.setProgressBar(p);
});

ipcMain.handle('hide-window', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

ipcMain.handle('min-max-window', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else if (mainWindow.maximizable) {
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

ipcMain.handle('quit-app', () => {
  app.quit();
  app.exit();
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
  shell.openItem(folderPath);
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

ipcMain.handle('appRestart', () => {
  app.relaunch();
  app.exit();
});

ipcMain.handle('getPrimaryDisplaySizes', () => {
  return screen.getPrimaryDisplay().bounds;
});

ipcMain.handle('init-discord-rpc', () => {
  discordRPC.initRPC();
});

ipcMain.handle('update-discord-rpc', (event, p) => {
  discordRPC.updateDetails(p);
});

ipcMain.handle('shutdown-discord-rpc', () => {
  discordRPC.shutdownRPC();
});

ipcMain.handle('start-listener', async (e, dirPath) => {
  try {
    if (watcher) {
      await watcher.stop();
      watcher = null;
    }
    watcher = await nsfw(dirPath, events => {
      mainWindow.webContents.send('listener-events', events);
    });
    return watcher.start();
  } catch (err) {
    console.error(err);
    return Promise.reject(err);
  }
});

ipcMain.handle('stop-listener', async () => {
  if (watcher) {
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
  autoUpdater.setFeedURL({
    owner: 'gorilla-devs',
    repo: 'GDLauncher-Releases',
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
    autoUpdater.quitAndInstall(true, true);
  } else {
    if (process.platform === 'win32') {
      const updaterVbs = 'updater.vbs';
      const updaterBat = 'updateLauncher.bat';
      await fs.writeFile(
        path.join(tempFolder, updaterBat),
        `robocopy "${path.join(tempFolder, 'update')}" "." /MOV /E${
          quitAfterInstall ? '' : ` & "${app.getPath('exe')}"`
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

      spawn(path.join(tempFolder, updaterVbs), {
        cwd: path.dirname(app.getPath('exe')),
        detached: true,
        shell: true
      });
    } else {
      // Linux
      const updateScript = spawn(
        `sleep 2 && cp -lrf "${path.join(
          tempFolder,
          'update'
        )}"/* "." && rm -rf "${path.join(tempFolder, 'update')}"${
          quitAfterInstall ? '' : ` && "${app.getPath('exe')}"`
        }`,
        {
          cwd: path.dirname(app.getPath('exe')),
          detached: true,
          shell: true,
          stdio: 'ignore'
        }
      );
      updateScript.unref();
    }
    app.quit();
    app.exit();
  }
});
