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
} = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");
const nsfw = require("nsfw");
const murmur = require("murmur2-calculator");

const discordRPC = require("./discordRPC");

// This gets rid of this: https://github.com/electron/electron/issues/13186
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;
// app.commandLine.appendSwitch("disable-web-security");
app.commandLine.appendSwitch("disable-gpu-vsync=gpu");
Menu.setApplicationMenu();

const isDev = process.env.NODE_ENV === "development";

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
    backgroundColor: "#353E48",
    webPreferences: {
      experimentalFeatures: true,
      nodeIntegration: true,
      webSecurity: !isDev
    }
  });

  globalShortcut.register("CommandOrControl+R", () => {
    mainWindow.reload();
  });

  globalShortcut.register("F5", () => {
    mainWindow.reload();
  });

  mainWindow.webContents.session.webRequest.onHeadersReceived(
    {
      urls: ["http://*/*", "https://*/*"]
    },
    (details, callback) => {
      // eslint-disable-next-line
      delete details.responseHeaders["Access-Control-Allow-Origin"];
      // eslint-disable-next-line
      delete details.responseHeaders["access-control-allow-origin"];
      if (details.url.includes("www.google-analytics.com")) {
        // eslint-disable-next-line
        details.responseHeaders["Access-Control-Allow-Origin"] = [
          "http://localhost:3000"
        ];
      } else {
        // eslint-disable-next-line
        details.responseHeaders["Access-Control-Allow-Origin"] = ["*"];
      }
      callback({
        cancel: false,
        responseHeaders: details.responseHeaders
      });
    }
  );

  tray = new Tray(
    isDev
      ? path.join(__dirname, "./icon.png")
      : path.join(__dirname, "../build/icon.png")
  );
  const trayMenuTemplate = [
    {
      label: "GDLauncher",
      enabled: false
    },
    {
      label: "Show Dev Tools",
      click: () => mainWindow.webContents.openDevTools()
    }
  ];

  const trayMenu = Menu.buildFromTemplate(trayMenuTemplate);
  tray.setContextMenu(trayMenu);
  tray.setToolTip("GDLauncher");
  tray.on("double-click", () => mainWindow.show());

  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`,
    {
      userAgent: "GDLauncher"
    }
  );
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.on("maximize", () => {
    mainWindow.webContents.send("window-maximized");
  });

  mainWindow.on("unmaximize", () => {
    mainWindow.webContents.send("window-minimized");
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.handle("update-progress-bar", (event, p) => {
  mainWindow.setProgressBar(p);
});

ipcMain.handle("hide-window", () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

ipcMain.handle("min-max-window", () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else if (mainWindow.maximizable) {
    mainWindow.maximize();
  }
});

ipcMain.handle("minimize-window", () => {
  mainWindow.minimize();
});

ipcMain.handle("show-window", () => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
});

ipcMain.handle("quit-app", () => {
  app.quit();
});

ipcMain.handle("getUserDataPath", () => {
  return app.getPath("userData");
});

ipcMain.handle("getAppdataPath", () => {
  return app.getPath("appData");
});

ipcMain.handle("getAppPath", () => {
  return app.getAppPath();
});

ipcMain.handle("getAppVersion", () => {
  return app.getVersion();
});

ipcMain.handle("getIsWindowMaximized", () => {
  return !mainWindow.maximizable;
});

ipcMain.handle("openFolder", (e, path) => {
  shell.openItem(path);
});

ipcMain.handle("openFolderDialog", (e, defaultPath) => {
  return dialog.showOpenDialog({
    properties: ["openDirectory"],
    defaultPath: path.dirname(defaultPath)
  });
});

ipcMain.handle("openFileDialog", () => {
  return dialog.showOpenDialog({
    properties: ["openFile"]
  });
});

ipcMain.handle("appRestart", () => {
  app.relaunch();
  app.exit(0);
});

ipcMain.handle("getPrimaryDisplaySizes", () => {
  return screen.getPrimaryDisplay().bounds;
});

// AutoUpdater

autoUpdater.autoDownload = false;

autoUpdater.on("update-available", () => {
  if (process.env.NODE_ENV !== "development") {
    autoUpdater.downloadUpdate();
  } else {
    // Fake update
    mainWindow.webContents.send("updateAvailable");
  }
});

autoUpdater.on("update-downloaded", () => {
  mainWindow.webContents.send("updateAvailable");
});

ipcMain.handle("checkForUpdates", () => {
  // autoUpdater.checkForUpdates();
});

ipcMain.handle("installUpdateAndRestart", () => {
  // autoUpdater.quitAndInstall(true, true);
});

ipcMain.handle("init-discord-rpc", () => {
  discordRPC.initRPC();
});

ipcMain.handle("update-discord-rpc", (event, p) => {
  discordRPC.updateDetails(p);
});

ipcMain.handle("shutdown-discord-rpc", () => {
  discordRPC.shutdownRPC();
});

ipcMain.handle("start-listener", async (e, dirPath) => {
  try {
    watcher = await nsfw(dirPath, events => {
      mainWindow.webContents.send("listener-events", events);
    });
    return watcher.start();
  } catch (err) {
    console.error(err);
    return Promise.reject(err);
  }
});

ipcMain.handle("stop-listener", async () => {
  if (watcher) {
    await watcher.stop();
  }
});

ipcMain.handle("calculateMurmur2FromPath", (e, filePath) => {
  return new Promise((resolve, reject) => {
    return murmur(filePath).then(v => {
      if (v.toString().length === 0) reject();
      return resolve(v);
    });
  });
});
