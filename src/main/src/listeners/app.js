import { app, clipboard, shell, screen, dialog } from 'electron';
import log from 'electron-log';
import path from 'path';
import { addListener } from '../messageListener';
import EV from '../../../common/messageEvents';
import { mainWindow } from '../windows';

addListener(EV.UPDATE_PROGRESS_BAR, async v => {
  mainWindow.setProgressBar(v);
});

addListener(EV.HIDE_MAIN_WINDOW, async () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

addListener(EV.MINMAX_MAIN_WINDOW, async () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

addListener(EV.MINIMIZE_MAIN_WINDOW, async () => {
  mainWindow.minimize();
});

addListener(EV.SHOW_MAIN_WINDOW, async () => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
});

addListener(EV.QUIT_APP, async () => {
  mainWindow.close();
  mainWindow = null;
});

addListener(EV.IS_APP_IMAGE, async () => {
  return process.env.APPIMAGE;
});

addListener(EV.GET_APP_DATA_PATH, async () => {
  return app.getPath('appData');
});

// Returns path to app.asar
addListener(EV.GET_APP_PATH, async () => {
  return app.getAppPath();
});

addListener(EV.GET_USER_DATA_PATH, async () => {
  return app.getPath('userData');
});

addListener(EV.GET_EXECUTABLE_PATH, async () => {
  return path.dirname(app.getPath('exe'));
});

addListener(EV.GET_APP_VERSION, async () => {
  return app.getVersion();
});

addListener(EV.IS_MAIN_WINDOW_MAXIMIZED, async () => {
  return !mainWindow.maximizable;
});

addListener(EV.OPEN_FOLDER, async folderPath => {
  shell.openExternal(folderPath);
});

addListener(EV.OPEN_FOLDER_DIALOG, async defaultPath => {
  return dialog.showOpenDialog({
    properties: ['openDirectory'],
    defaultPath: path.dirname(defaultPath)
  });
});

addListener(EV.OPEN_FILE_DIALOG, async filters => {
  return dialog.showOpenDialog({
    properties: ['openFile'],
    filters
  });
});

addListener(EV.OPEN_MAIN_WINDOW_DEVTOOLS, async () => {
  mainWindow.webContents.openDevTools({ mode: 'undocked' });
});

addListener(EV.RESTART_APP, async () => {
  log.log('Restarting app');
  app.relaunch();
  mainWindow.close();
});

addListener(EV.GET_ALL_DISPLAYS_BOUNDS, async () => {
  return screen.getAllDisplays().map(v => v.bounds);
});

addListener(EV.COPY_TEXT_TO_CLIPBOARD, async v => {
  clipboard.writeText(v);
});

addListener(EV.COPY_IMAGE_TO_CLIPBOARD, async v => {
  clipboard.writeImage(v);
});
