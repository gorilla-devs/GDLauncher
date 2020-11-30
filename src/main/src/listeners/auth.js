import path from 'path';
import { promises as fs } from 'fs';
import { DB_SCHEMA } from 'src/common/persistedKeys';
import { addListener } from '../messageListener';
import EV from '../../../common/messageEvents';
import { extractFace, getPlayerSkin } from '../helpers';
import { APPDATA_PATH, DB_INSTANCE } from '../config';

addListener(EV.AUTH.GET_PLAYER_SKIN_URL, async accountId => {
  return getPlayerSkin(accountId);
});

addListener(EV.AUTH.GET_PLAYER_FACE_SKIN, skinUrl => {
  return extractFace(skinUrl);
});

addListener(EV.AUTH.GET_CLIENT_TOKEN, () => {
  return DB_INSTANCE.get(DB_SCHEMA.clientToken);
});

const mcFolder = process.platform === 'darwin' ? 'minecraft' : '.minecraft';
const vanillaMCPath =
  process.platform === 'linux'
    ? path.resolve(APPDATA_PATH, '../', mcFolder)
    : path.join(APPDATA_PATH, mcFolder);

addListener(EV.AUTH.GET_MC_VANILLA_LAUNCHER_PROFILES_FROM_FILE, async () => {
  const vnlJson = JSON.parse(
    await fs.readFile(path.join(vanillaMCPath, 'launcher_profiles.json'))
  );
  return vnlJson;
});

addListener(EV.AUTH.SET_MC_VANILLA_LAUNCHER_PROFILES_FROM_FILE, vnlJson => {
  return fs.writeFile(
    path.join(vanillaMCPath, 'launcher_profiles.json'),
    JSON.stringify(vnlJson)
  );
});
