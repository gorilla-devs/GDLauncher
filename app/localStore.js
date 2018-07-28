
const Store = require('electron-store');

const store = new Store();
console.log(`Store: ${store.path}`);
export default store;
