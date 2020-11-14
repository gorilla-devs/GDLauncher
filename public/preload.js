const { ipcRenderer } = require('electron');
const backend = require('i18next-electron-fs-backend');

// NOTE: if enable contextIsolation, you need to change the code like below
/*
contextBridge.exposeInMainWorld('api', {
  i18nextElectronBackend: backend.preloadBindings(ipcRenderer)
});
*/
window.api = {
  i18nextElectronBackend: backend.preloadBindings(ipcRenderer)
};
