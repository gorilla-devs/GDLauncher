import isElectron from 'is-electron';

const Root = isElectron()
  ? require('./app/desktop/DesktopRoot').default
  : require('./app/browser/BrowserRoot').default;

export default Root;
