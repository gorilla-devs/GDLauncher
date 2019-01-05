import path from 'path';
import electron from 'electron';
import getAppPath from './utils/getAppPath';


export const WINDOWS = 'win32';
export const LINUX = 'linux';
export const DARWIN = 'darwin';
export const APPPATH = getAppPath();
export const DATAPATH = path.join(
  process.env.APPDATA || (electron.app || electron.remote.app).getPath('userData'),
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
export const GDL_LEGACYJAVAFIXER_MOD_URL = 'https://gdevs.io/legacyjavafixer-1.0.jar';
export const CURSEMETA_API_URL = `https://staging_cursemeta.dries007.net/api/v3`;
export const CURSEFORGE_MODLOADERS_API =
  'https://modloaders.cursecdn.com/647622546/maven';
export const NEWS_URL =
  'https://minecraft.net/en-us/api/tiles/channel/not_set,Community%20content/region/None/category/Culture,Insider,News/page/1';
export const JAVA_URL = 'https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html';
export const UPDATE_URL =
  'https://raw.githubusercontent.com/gorilla-devs/GDLauncher/master/package.json';
export const THEMES = {
  default: {
    name: 'Default',
    primary: '#2980b9',
    'secondary-color-1': '#34495e',
    'secondary-color-2': '#2c3e50',
    'secondary-color-3': '#212b36'
  },
  carrotUniverse: {
    name: 'Carrot Universe',
    primary: '#d35400',
    'secondary-color-1': '#433c8c',
    'secondary-color-2': '#2f2878',
    'secondary-color-3': '#1b1464'
  },
  concreteLeaf: {
    name: 'Concrete Leaf',
    primary: '#16a085',
    'secondary-color-1': '#3b3f42',
    'secondary-color-2': '#272b2e',
    'secondary-color-3': '#13171a'
  },
  bloodyMurder: {
    name: 'Bloody Murder',
    primary: '#aa1e0f',
    "secondary-color-1": "#282c2f",
    "secondary-color-2": "#14181b",
    "secondary-color-3": "#000407"
  }
};