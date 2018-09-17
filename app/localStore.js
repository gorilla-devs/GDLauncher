
import Store from 'electron-store';
import log from 'electron-log';

const store = new Store();
log.log(`Config store: ${store.path}`);
export default store;
