import isElectron from 'is-electron';
import storage from 'redux-persist/lib/storage';

export default {
  key: 'root',
  storage: isElectron()
    ? require('redux-persist-electron-storage')({
        electronStoreOpts: {
          name: 'config',
          // This is used to ensure integrity, not for security reasons
          encryptionKey: 'GDLauncher',
          fileExtension: ''
        }
      })
    : storage,
  whitelist: ['settings', 'app']
};
