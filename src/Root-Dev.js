import isElectron from 'is-electron';
import DesktopRoot from './app/desktop/DesktopRoot';
import BrowserRoot from './app/browser/BrowserRoot';

const Root = isElectron() ? DesktopRoot : BrowserRoot;

export default Root;
