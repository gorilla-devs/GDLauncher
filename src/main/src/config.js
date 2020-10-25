import { app } from 'electron';
import path from 'path';
import levelup from 'levelup';
import leveldown from 'leveldown';
import encode from 'encoding-down';

export const USERDATA_PATH = (() => app.getPath('userData'))();
export const INSTANCES_PATH = path.join(USERDATA_PATH, 'instances');
export const DATASTORE_PATH = path.join(USERDATA_PATH, 'datastore');
export const LIBRARIES_PATH = path.join(DATASTORE_PATH, 'libraries');
export const MC_VERSIONS_PATH = path.join(LIBRARIES_PATH, 'net', 'minecraft');
export const MC_ASSETS_PATH = path.join(DATASTORE_PATH, 'assets');
export const TEMP_PATH = path.join(USERDATA_PATH, 'temp');

export const DB_INSTANCE = levelup(
  encode(
    leveldown(path.join(USERDATA_PATH, 'configDB'), { valueEncoding: 'json' })
  )
);
