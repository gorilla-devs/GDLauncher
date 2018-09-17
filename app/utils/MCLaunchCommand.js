import os from 'os';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import findJavaHome from './javaLocationFinder';
import { PACKS_PATH, INSTANCES_PATH, WINDOWS } from '../constants';
import { parseConfigLibraries } from './getMCFilesList';
import store from '../localStore';

const getStartCommand = async (packName, userData) => {

  const packJson = JSON.parse(await promisify(fs.readFile)(path.join(PACKS_PATH, packName, 'config.json')));
  let forge = packJson.forgeID;
  const javaPath = await findJavaHome();
  const dosName = os.release().substr(0, 2) === 10 ? '"-Dos.name=Windows 10" -Dos.version=10.0 ' : '';
  const version = packJson.forgeID === null ? packJson.version : packJson.version;
  // It concatenates vanilla and forge libraries. If the instance does not contain forge, it concatenates an empty array
  const libs = packJson.libraries;
  const Arguments = getMCArguments(packJson, packName, userData);
  const dividerChar = os.platform() === WINDOWS ? ';' : ':';

  const completeCMD = `
"${javaPath}" ${dosName}
${os.platform() === WINDOWS ? '-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump' : ''} 
-Djava.library.path="${path.join(PACKS_PATH, packName, 'natives')}" 
-Dminecraft.client.jar="${path.join(INSTANCES_PATH, 'versions', version, `${version}.jar`)}" 
-cp ${libs
      .filter(lib => !lib.natives)
      .map(lib => `"${path.join(INSTANCES_PATH, 'libraries', lib.path)}"`)
      .join(dividerChar)}${dividerChar}${`"${path.join(INSTANCES_PATH, 'versions', packJson.version, `${packJson.version}.jar`)}"`} 
${packJson.mainClass} ${Arguments}
  `;
  return completeCMD.replace(/\n|\r/g, '');
};

const getMCArguments = (json, packName, userData) => {
  let Arguments = json.minecraftArguments;
  // Replaces the arguments and returns the result
  return Arguments
    .replace('${auth_player_name}', userData.displayName)
    .replace('${auth_session}', userData.accessToken) // Legacy check for really old versions
    .replace('${game_directory}', path.join(PACKS_PATH, packName))
    .replace('${game_assets}', path.join(INSTANCES_PATH, 'assets', json.assets === 'legacy' ? '/virtual/legacy' : '')) // Another check for really old versions
    .replace('${version_name}', json.forgeID !== null ? json.forgeID : json.version)
    .replace('${assets_root}', path.join(INSTANCES_PATH, 'assets', json.assets === 'legacy' ? '/virtual/legacy' : ''))
    .replace('${assets_index_name}', json.assets)
    .replace('${auth_uuid}', userData.uuid)
    .replace('${auth_access_token}', userData.accessToken)
    .replace('${user_properties}', "{}")
    .replace('${user_type}', userData.legacy ? 'legacy' : 'mojang')
    .replace('${version_type}', json.type);
}

export default getStartCommand;
