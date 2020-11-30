import EV from './messageEvents';

export const DB_SCHEMA = {
  clientToken: 'clientToken',
  manifests: {
    mcVersions: 'mcVersions',
    fabric: 'fabric',
    forge: 'forge',
    java: 'java',
    addonCategories: 'addonCategories'
  },
  persisted: {
    lastVersionShown: 'lastVersionShown',
    currentAccountId: 'currentAccountId',
    accounts: 'accounts',
    isNewUser: 'isNewUser',
    showNews: 'showNews',
    concurrentDownloads: 'concurrentDownloads',
    customJavaPath: 'customJavaPath',
    potatoPcMode: 'potatoPcMode'
  }
};

export const persistedKeys = [
  {
    get: EV.PERSISTOR.GET_IS_NEW_USER,
    set: EV.PERSISTOR.SET_IS_NEW_USER,
    key: DB_SCHEMA.persisted.isNewUser,
    default: true
  },
  {
    get: EV.PERSISTOR.GET_SHOW_NEWS,
    set: EV.PERSISTOR.SET_SHOW_NEWS,
    key: DB_SCHEMA.persisted.showNews,
    default: true
  },
  {
    get: EV.PERSISTOR.GET_CONCURRENT_DOWNLOADS,
    set: EV.PERSISTOR.SET_CONCURRENT_DOWNLOADS,
    key: DB_SCHEMA.persisted.concurrentDownloads,
    default: 4
  },
  {
    get: EV.PERSISTOR.GET_CURRENT_ACCOUNT_ID,
    set: EV.PERSISTOR.SET_CURRENT_ACCOUNT_ID,
    key: DB_SCHEMA.persisted.currentAccountId,
    default: false
  },
  {
    get: EV.PERSISTOR.GET_ACCOUNTS,
    set: EV.PERSISTOR.SET_ACCOUNTS,
    key: DB_SCHEMA.persisted.accounts,
    default: []
  },
  {
    get: EV.PERSISTOR.GET_POTATO_PC_MODE,
    set: EV.PERSISTOR.SET_POTATO_PC_MODE,
    key: DB_SCHEMA.persisted.potatoPcMode,
    default: false
  }
];
