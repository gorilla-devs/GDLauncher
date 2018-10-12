import path from 'path';
import getAppPath from './utils/getAppPath';

export const APPPATH = getAppPath.getAppPath();
export const DATAPATH = path.join(
  process.env.APPDATA ||
    (process.platform === DARWIN
      ? path.join(process.env.HOME, 'Library/Preferences')
      : '/var/local'),
  'GDLauncher'
);
export const LAUNCHER_FOLDER = 'launcherData';
export const INSTANCES_FOLDER = 'instances';
export const SERVERS_PATH = path.join(DATAPATH, 'servers');
export const INSTANCES_PATH = path.join(DATAPATH, INSTANCES_FOLDER);
export const PACKS_PATH = path.join(DATAPATH, INSTANCES_FOLDER, 'packs');
export const META_PATH = path.join(DATAPATH, 'meta');
export const GAME_VERSIONS_URL =
  'https://launchermeta.mojang.com/mc/game/version_manifest.json';
export const FORGE_PROMOS =
  'http://files.minecraftforge.net/maven/net/minecraftforge/forge/json';
export const ACCESS_TOKEN_VALIDATION_URL =
  'https://authserver.mojang.com/validate';
export const ACCESS_TOKEN_REFRESH_URL = 'https://authserver.mojang.com/refresh';
export const MAVEN_REPO = 'http://central.maven.org/maven2';
export const MC_LIBRARIES_URL = 'https://libraries.minecraft.net';
export const LOGIN_PROXY_API = 'https://api.gdevs.io/auth';
export const LOGIN_TOKEN_PROXY_API = 'https://api.gdevs.io/authToken';
export const GDL_COMPANION_MOD_URL = 'https://gdevs.io/GDLCompanion.jar';
export const CURSEMETA_API_URL = `https://staging_cursemeta.dries007.net/api/v3`;
export const WINDOWS = 'win32';
export const LINUX = 'linux';
export const DARWIN = 'darwin';
export const NEWS_URL =
  'https://minecraft.net/en-us/api/tiles/channel/not_set,Community%20content/region/None/category/Culture,Insider,News/page/1';
export const JAVA_URL = 'https://java.com/download';
export const UPDATE_URL =
  'https://raw.githubusercontent.com/gorilla-devs/GDLauncher/master/package.json';
export const UPDATE_URL_CHECKSUMS =
  'https://dl.gorilladevs.com/releases/latestChecksums.json';
