import { promisify } from 'es6-promisify';
import os from 'os';
import fs from 'fs';
import findJavaHome from './javaLocationFinder';
import { LAUNCHER_FOLDER, PACKS_FOLDER_NAME, APPPATH, WINDOWS } from '../constants';
import { extractLibs, extractMainJar } from '../workers/common/vanilla';
import store from '../localStore';

const getStartCommand = async (packName, userData) => {

  const packJson = JSON.parse(fs.readFileSync(`${APPPATH}${LAUNCHER_FOLDER}/${PACKS_FOLDER_NAME}/${packName}/vnl.json`));
  const javaPath = await findJavaHome();
  const dosName = os.release().substr(0, 2) === 10 ? '"-Dos.name=Windows 10" -Dos.version=10.0 ' : '';
  const version = packJson.id;
  const libs = extractLibs(packJson, false);
  const mainJar = extractMainJar(packJson, false);
  const Arguments = getMCArguments(packJson, packName, userData);
  const dividerChar = os.platform() === WINDOWS ? ';' : ':';

  const completeCMD = `
"${javaPath}" ${dosName}
${os.platform() === WINDOWS ? '-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump' : ''} 
-Djava.library.path="${APPPATH}${LAUNCHER_FOLDER}/${PACKS_FOLDER_NAME}/${packName}/natives" 
-Dminecraft.client.jar="${APPPATH}${LAUNCHER_FOLDER}/versions/${version}/${version}.jar" 
-cp ${libs
    .filter(lib => !lib.natives)
    .map(lib => `"${APPPATH}${LAUNCHER_FOLDER}/libraries/${lib.path}"`)
    .join(dividerChar)}${dividerChar}${`"${APPPATH}${LAUNCHER_FOLDER}/versions/${mainJar[0].path}"`} 
${packJson.mainClass} ${Arguments}
  `;

  return completeCMD.replace(/\n|\r/g, '');
};

const getMCArguments = (json, packName, userData) => {
  let Arguments = '';
  if (json.minecraftArguments) {
    // Up to 1.13
    Arguments = json.minecraftArguments;
  } else if (json.arguments) {
    // From 1.13
    Arguments = json.arguments.game.filter(arg => typeof arg === 'string').join(' ');
  }
  // Replaces the arguments and returns the result
  return Arguments
    .replace('${auth_player_name}', userData.displayName)
    .replace('${auth_session}', userData.accessToken) // Legacy check for really old versions
    .replace('${game_directory}', `${APPPATH}${LAUNCHER_FOLDER}/${PACKS_FOLDER_NAME}/${packName}`)
    .replace('${game_assets}', `${APPPATH}${LAUNCHER_FOLDER}/assets${json.assets === 'legacy' ? '/virtual/legacy' : ''}`) // Another check for really old versions
    .replace('${version_name}', json.id)
    .replace('${assets_root}', `${APPPATH}${LAUNCHER_FOLDER}/assets${json.assets === 'legacy' ? '/virtual/legacy' : ''}`)
    .replace('${assets_index_name}', json.assets)
    .replace('${auth_uuid}', userData.uuid)
    .replace('${auth_access_token}', userData.accessToken)
    .replace('${user_properties}', "{}")
    .replace('${user_type}', userData.legacy ? 'legacy' : 'mojang')
    .replace('${version_type}', json.type);
}

export default getStartCommand;
