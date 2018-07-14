import { promisify } from 'es6-promisify';
import findJavaHome from 'find-java-home';
import os from 'os';
import fs from 'fs';
import { LAUNCHER_FOLDER, PACKS_FOLDER_NAME } from '../constants';
import { extractLibs, extractMainJar } from '../workers/common/vanilla';
import store from '../localStore';

const getStartCommand = async (packName, userData) => {
  const FJH_Promise = promisify(findJavaHome);

  const packJson = JSON.parse(fs.readFileSync(`${LAUNCHER_FOLDER}/${PACKS_FOLDER_NAME}/${packName}/vnl.json`));
  const javaPath = `${await FJH_Promise({ allowJre: true })}\\javapath\\java.exe`;
  const dosName = os.release().substr(0, 2) === 10 ? '"-Dos.name=Windows 10" -Dos.version=10.0 ' : '';
  const version = packJson.id;
  const libs = extractLibs(packJson, false);
  const mainJar = extractMainJar(packJson, false);
  const Arguments = getMCArguments(packJson, packName, userData);

  const completeCMD = `
"${javaPath}" ${dosName}
-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump 
-Djava.library.path="${process.cwd()}\\${LAUNCHER_FOLDER}\\${PACKS_FOLDER_NAME}\\${packName}\\natives" 
-Dminecraft.client.jar="${process.cwd()}\\${LAUNCHER_FOLDER}\\versions\\${version}\\${version}.jar" 
-cp ${libs
      .filter(lib => !lib.natives)
      .map(lib => `"${process.cwd()}\\${LAUNCHER_FOLDER}\\libraries\\${lib.path}"`)
      .join(';')};${`"${process.cwd()}\\${LAUNCHER_FOLDER}\\versions\\${mainJar[0].path}"`} 
${packJson.mainClass} ${Arguments}
  `;

  return completeCMD.replace(/\n|\r/g, '');
};

const getMCArguments = (json, packName, userData) => {
  let Arguments = '';
  if (json.minecraftArguments) {
    Arguments = json.minecraftArguments
      .replace('${auth_player_name}', userData.username)
      .replace('${auth_session}', userData.accessToken) // Legacy check for really old versions
      .replace('${game_directory}', `${process.cwd()}/${LAUNCHER_FOLDER}/${PACKS_FOLDER_NAME}/${packName}`)
      .replace('${game_assets}', `${process.cwd()}/${LAUNCHER_FOLDER}/assets${json.assets === 'legacy' ? '/virtual/legacy' : ''}`) // Another check for really old versions
      .replace('${version_name}', json.id)
      .replace('${assets_root}', `${process.cwd()}/${LAUNCHER_FOLDER}/assets${json.assets === 'legacy' ? '/virtual/legacy' : ''}`)
      .replace('${assets_index_name}', json.assets)
      .replace('${auth_uuid}', userData.uuid)
      .replace('${auth_access_token}', userData.accessToken)
      .replace('${user_properties}', "{}")
      .replace('${user_type}', userData.legacy ? 'legacy' : 'mojang')
      .replace('${version_type}', json.type);
  }
  return Arguments;
}

export default getStartCommand;
