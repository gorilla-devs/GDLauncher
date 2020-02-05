const {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  dialog,
  shell,
  screen
} = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

const discordRPC = require("./discordRPC");

// This gets rid of this: https://github.com/electron/electron/issues/13186
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;
app.commandLine.appendSwitch("disable-web-security");
app.commandLine.appendSwitch("disable-gpu-vsync=gpu");
Menu.setApplicationMenu();

const isDev = process.env.NODE_ENV === "development";

let mainWindow;
let tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    minWidth: 1100,
    minHeight: 800,
    show: true,
    frame: false,
    backgroundColor: "#353E48",
    webPreferences: {
      experimentalFeatures: true,
      nodeIntegration: true,
      webSecurity: false
    }
  });

  // mainWindow.webContents.session.webRequest.onHeadersReceived(
  //   {
  //     urls: []
  //   },
  //   (details, callback) => {
  //     // eslint-disable-next-line
  //     delete details.responseHeaders["Access-Control-Allow-Origin"];
  //     // eslint-disable-next-line
  //     delete details.responseHeaders["access-control-allow-origin"];
  //     // eslint-disable-next-line
  //     details.responseHeaders["Access-Control-Allow-Origin"] = ["*"];
  //     callback({
  //       cancel: false,
  //       responseHeaders: details.responseHeaders
  //     });
  //   }
  // );

  tray = new Tray(
    isDev
      ? path.join(__dirname, "./logo.png")
      : path.join(__dirname, "../build/logo.png")
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

ipcMain.handle("getIsWindowMaximized", () => {
  return !mainWindow.maximizable;
});

ipcMain.handle("openFolder", (e, path) => {
  shell.openPath(path);
});

ipcMain.handle("openFolderDialog", (e, defaultPath) => {
  return dialog.showOpenDialog({
    properties: ["openDirectory"],
    defaultPath: path.dirname(defaultPath)
  });
});

ipcMain.handle("openFileDialog", () => {
  return dialog.showOpenDialog(mainWindow, {
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
  autoUpdater.downloadUpdate();
});

autoUpdater.on("update-downloaded", () => {
  mainWindow.webContents.send("updateAvailable");
});

ipcMain.handle("checkForUpdates", () => {
  autoUpdater.checkForUpdates();
});

ipcMain.handle("installUpdateAndRestart", () => {
  autoUpdater.quitAndInstall(true, true);
});

ipcMain.on("init-discord-rpc", () => {
  discordRPC.initRPC();
});

ipcMain.on("update-discord-rpc", (event, p) => {
  discordRPC.updateDetails(p);
});

ipcMain.on("shutdown-discord-rpc", () => {
  discordRPC.shutdownRPC();
});
