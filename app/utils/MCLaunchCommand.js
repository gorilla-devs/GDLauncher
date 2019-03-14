import os from 'os';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import log from 'electron-log';
import { findJavaHome } from './javaHelpers';
import { PACKS_PATH, INSTANCES_PATH, WINDOWS, META_PATH } from '../constants';
import { computeVanillaAndForgeLibraries } from './getMCFilesList';

const getStartCommand = async (packName, userData, ram) => {
  const instanceConfigJSON = JSON.parse(
    await promisify(fs.readFile)(path.join(PACKS_PATH, packName, 'config.json'))
  );
  const vanillaJSON = JSON.parse(
    await promisify(fs.readFile)(
      path.join(
        META_PATH,
        'net.minecraft',
        instanceConfigJSON.version,
        `${instanceConfigJSON.version}.json`
      )
    )
  );
  const forge = instanceConfigJSON.forgeVersion;
  let forgeJSON = null;
  // Handling legacy GDLauncher instances without the forge- in the name
  if (forge !== null) {
    try {
      forgeJSON = JSON.parse(
        await promisify(fs.readFile)(
          path.join(META_PATH, 'net.minecraftforge', forge, `${forge}.json`)
        )
      );
    } catch {
      forgeJSON = JSON.parse(
        await promisify(fs.readFile)(
          path.join(
            META_PATH,
            'net.minecraftforge',
            `forge-${forge}`,
            `forge-${forge}.json`
          )
        )
      );
    }
  }

  const javaPath = await findJavaHome();
  const dosName =
    os.release().substr(0, 2) === 10
      ? '"-Dos.name=Windows 10" -Dos.version=10.0 '
      : '';
  // It concatenates vanilla and forge libraries. If the instance does not contain forge, it concatenates an empty array
  const libs = await computeVanillaAndForgeLibraries(vanillaJSON, forgeJSON);
  const Arguments = getMCArguments(vanillaJSON, forgeJSON, packName, userData);
  const mainClass =
    forge === null ? vanillaJSON.mainClass : forgeJSON.mainClass;
  const dividerChar = os.platform() === WINDOWS ? ';' : ':';

  const completeCMD = `
"${javaPath}" -Dfml.ignorePatchDiscrepancies=true -Dfml.ignoreInvalidMinecraftCertificates=true ${dosName}
${
  os.platform() === WINDOWS
    ? '-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump'
    : ''
}
 -Xms256m -Xmx${ram}m -Djava.library.path="${path.join(
    PACKS_PATH,
    packName,
    'natives'
  )}"
 -Dminecraft.client.jar="${path.join(
   INSTANCES_PATH,
   'versions',
   vanillaJSON.id,
   `${vanillaJSON.id}.jar`
 )}"
 -cp ${libs
   .filter(lib => !lib.natives)
   .map(lib => `"${lib.path}"`)
   .join(dividerChar)}${dividerChar}${`"${path.join(
    INSTANCES_PATH,
    'versions',
    vanillaJSON.id,
    `${vanillaJSON.id}.jar`
  )}"`}
 ${mainClass} ${Arguments}
  `;
  // We need to hide the access token before printing it to the logs
  log.info(
    completeCMD
      .replace(/\n|\r/g, '')
      .replace(userData.accessToken, 'HIDDEN_ACCESS_TOKEN')
  );
  return completeCMD.replace(/\n|\r/g, '');
};

const getMCArguments = (vanilla, forge, packName, userData) => {
  let Arguments = '';
  if (forge !== null && forge.minecraftArguments) {
    Arguments = forge.minecraftArguments;
  } else if (vanilla.minecraftArguments) {
    // Up to 1.13
    Arguments = vanilla.minecraftArguments;
  } else if (vanilla.arguments) {
    // From 1.13
    Arguments = vanilla.arguments.game
      .filter(arg => typeof arg === 'string')
      .join(' ');
  }
  // Replaces the arguments and returns the result
  return Arguments.replace('${auth_player_name}', userData.displayName)
    .replace('${auth_session}', userData.accessToken) // Legacy check for really old versions
    .replace('${game_directory}', `"${path.join(PACKS_PATH, packName)}"`)
    .replace(
      '${game_assets}',
      path.join(
        INSTANCES_PATH,
        'assets',
        vanilla.assets === 'legacy' ? '/virtual/legacy' : ''
      )
    ) // Another check for really old versions
    .replace('${version_name}', forge !== null ? forge.id : vanilla.id)
    .replace(
      '${assets_root}',
      path.join(
        INSTANCES_PATH,
        'assets',
        vanilla.assets === 'legacy' ? '/virtual/legacy' : ''
      )
    )
    .replace('${assets_index_name}', vanilla.assets)
    .replace('${auth_uuid}', userData.uuid)
    .replace('${auth_access_token}', userData.accessToken)
    .replace('${user_properties}', '{}')
    .replace('${user_type}', userData.legacy ? 'legacy' : 'mojang')
    .replace('${version_type}', vanilla.type);
};

export default getStartCommand;
