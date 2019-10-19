const electron = require("electron");

const { app, BrowserWindow, ipcMain } = electron;
const path = require("path");

// This gets rid of this: https://github.com/electron/electron/issues/13186
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

const isDev = process.env.NODE_ENV === "development";

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    minWidth: 1100,
    minHeight: 800,
    webPreferences: {
      experimentalFeatures: true,
      nodeIntegration: true,
      webSecurity: false
    }
  });
  mainWindow.removeMenu();
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`,
    {
      userAgent: "GDLauncher"
    }
  );
  // if (isDev) {
    mainWindow.webContents.openDevTools();
  // }
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
