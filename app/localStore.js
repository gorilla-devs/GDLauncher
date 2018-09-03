
const Store = require('electron-store');

const store = new Store();
console.log(`Config store: ${store.path}`);
export default store;
