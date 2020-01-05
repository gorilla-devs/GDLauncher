const electron = require("electron");

const { app, BrowserWindow, ipcMain, Tray, Menu } = electron;
const path = require("path");

// const discordRPC = require("./discordRPC");

// This gets rid of this: https://github.com/electron/electron/issues/13186
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;
app.commandLine.appendSwitch("disable-web-security");
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
    backgroundColor: "#fff",
    webPreferences: {
      experimentalFeatures: true,
      nodeIntegration: true,
      webSecurity: false
    }
  });

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

ipcMain.on("update-progress-bar", (event, p) => {
  mainWindow.setProgressBar(p);
});

ipcMain.on("hide-window", () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

ipcMain.on("show-window", () => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
});

// ipcMain.on("init-discord-rpc", () => {
//   discordRPC.initRPC();
// });

// ipcMain.on("update-discord-rpc", (event, p) => {
//   discordRPC.updateDetails(p);
// });

// ipcMain.on("shutdown-discord-rpc", () => {
//   discordRPC.shutdownRPC();
// });
