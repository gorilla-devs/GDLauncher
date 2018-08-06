// This needs vanilla JS since it's used in the workers (not transpiled by babel)
const getAppPath = require('./utils/getAppPath');

module.exports = {
  LAUNCHER_FOLDER: 'dl',
  PACKS_FOLDER_NAME: 'packs',
  GAME_VERSIONS_URL: 'https://launchermeta.mojang.com/mc/game/version_manifest.json',
  ACCESS_TOKEN_VALIDATION_URL: 'https://authserver.mojang.com/validate',
  ACCESS_TOKEN_REFRESH_URL: 'https://authserver.mojang.com/refresh',
  LOGIN_PROXY_API: 'https://n7x0m4zh4f.execute-api.eu-west-1.amazonaws.com/Staging/login',
  WINDOWS: 'win32',
  LINUX: 'linux',
  DARWIN: 'darwin',
  APPPATH: getAppPath.getAppPath(),
  NEWS_URL: 'http://launchermeta.mojang.com/mc/news.json'
};
