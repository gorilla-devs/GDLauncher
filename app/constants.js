// This needs vanilla JS since it's used in the workers (not transpiled by babel)
const getAppPath = require('./utils/getAppPath');

module.exports = {
  LAUNCHER_FOLDER: 'launcherData',
  SERVERS_FOLDER_NAME: 'servers',
  PACKS_FOLDER_NAME: 'packs',
  GAME_VERSIONS_URL: 'https://launchermeta.mojang.com/mc/game/version_manifest.json',
  ACCESS_TOKEN_VALIDATION_URL: 'https://authserver.mojang.com/validate',
  ACCESS_TOKEN_REFRESH_URL: 'https://authserver.mojang.com/refresh',
  LOGIN_PROXY_API: 'https://api.gdevs.io/auth',
  LOGIN_TOKEN_PROXY_API: 'https://api.gdevs.io/authToken',
  WINDOWS: 'win32',
  LINUX: 'linux',
  DARWIN: 'darwin',
  APPPATH: getAppPath.getAppPath(),
  NEWS_URL: 'https://minecraft.net/en-us/api/tiles/channel/not_set,Community%20content/region/None/category/Culture,Insider,News/page/1',
  JAVA_URL: 'https://java.com/download',
  UPDATE_URL: 'https://dl.gorilladevs.com/releases/latest.json',
  UPDATE_URL_CHECKSUMS: 'https://dl.gorilladevs.com/releases/latestChecksums.json',
};
