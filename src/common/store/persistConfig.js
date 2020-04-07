import createElectronStorage from 'redux-persist-electron-storage';

export default {
  key: 'root',
  storage: createElectronStorage(),
  whitelist: ['settings', 'app']
};
