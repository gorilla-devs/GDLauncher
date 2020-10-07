import { ipcMain } from 'electron';
import log from 'electron-log';
import { mainWindow } from './windows';

let blockedListener = false;

const listeners = {};

export const sendMessage = (type, id, value, success) => {
  mainWindow.webContents.send('__MAIN_MESSAGE__', {
    type,
    id,
    value,
    success
  });
};

export function listenMessage() {
  const respondToMessage = (type, id, value, success = true) => {
    if (blockedListener) return;
    mainWindow.webContents.send('__MAIN_MESSAGE__', {
      type,
      id,
      value,
      success
    });
  };

  ipcMain.on('__RENDERER_MESSAGE__', async (event, message) => {
    if (blockedListener) return;
    const { type, id, value } = message;
    if (!listeners[type]) {
      respondToMessage(
        type,
        id,
        new Error(`Unhandled event type "${type}"`),
        false
      );
      log.warn('Received unhandled renderer message', message);
      return;
    }
    const callback = listeners[type];
    try {
      const result = await callback(value);
      respondToMessage(type, id, result);
    } catch (error) {
      log.error('response', error);
      respondToMessage(type, id, error, false);
    }
  });
}

export const addListener = (type, callback) => {
  if (listeners[type]) return;
  listeners[type] = callback;
};

export const blockListener = () => {
  blockedListener = !blockedListener;
};

export const registerListeners = () => {
  const modules = ['instances', 'discord', 'app'];
  let isOk = true;

  const notifyError = (name, error) => {
    log.error(`ERROR REGISTERING LISTENERS FOR ${name}`, error);
    isOk = false;
  };

  for (const name of modules) {
    try {
      // eslint-disable-next-line
      require(`./listeners/${name}`);
    } catch (error) {
      notifyError(name, error);
    }
  }

  return isOk;
};
