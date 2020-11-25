import path from 'path';
import { promises as fs } from 'fs';
import { addListener } from '../messageListener';
import EV from '../../../common/messageEvents';
import { extractFace, getPlayerSkin } from '../helpers';
import { APPDATA_PATH } from '../config';

addListener(EV.AUTH.AUTH.GET_PLAYER_SKIN, async id => {
  return getPlayerSkin(id);
});

addListener(EV.AUTH.GET_PLAYER_FACE_SKIN, skin => {
  return extractFace(skin);
});

addListener(EV.AUTH.GET_CLIENT_TOKEN, skin => {
  return extractFace(skin);
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
