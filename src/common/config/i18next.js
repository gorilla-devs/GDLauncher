import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import backend from 'i18next-electron-fs-backend';

i18n
  .use(backend)
  .use(initReactI18next)
  .init({
    ns: ['settings'],
    backend: {
      loadPath: './src/common/locales/{{lng}}/{{ns}}.json',
      addPath: './src/common/locales/{{lng}}/{{ns}}.missing.json',
      ipcRenderer: window.api.i18nextElectronBackend
    },

    // other options you might configure
    debug: true,
    saveMissing: true,
    saveMissingTo: 'current',
    lng: 'en'
  });

export default i18n;
