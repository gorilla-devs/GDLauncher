import createElectronStorage from 'redux-persist-electron-storage';

export default {
  key: 'root',
  storage: createElectronStorage({
    electronStoreOpts: {
      name: 'config_next',
      // This is used to ensure integrity, not for security reasons
      encryptionKey: 'GDLauncher',
      fileExtension: ''
    }
  }),
  whitelist: ['settings', 'app']
};
