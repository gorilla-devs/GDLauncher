import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-electron-language-detector';
import backend from 'i18next-electron-fs-backend';

i18n
  .use(backend)
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    ns: ['add_instance', 'settings'],
    supportedLngs: ['en', 'ja'],
    nonExplicitSupportedLngs: true,
    fallbackLng: 'en',
    backend: {
      loadPath: './src/common/locales/{{lng}}/{{ns}}.json',
      addPath: './src/common/locales/{{lng}}/{{ns}}.missing.json',
      ipcRenderer: window.api.i18nextElectronBackend
    },

    // other options you might configure
    debug: true,
    saveMissing: true,
    saveMissingTo: 'current'
  });

export default i18n;
