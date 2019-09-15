import os from 'os';
import { promises as fs } from 'fs';
import path from 'path';
import log from 'electron-log';
import { getJavaPath } from 'Reducers/actions';
import {
  PACKS_PATH,
  INSTANCES_PATH,
  WINDOWS,
  META_PATH,
  CLASSPATH_DIVIDER_CHAR
} from '../constants';
import { computeVanillaAndForgeLibraries } from './getMCFilesList';

const getStartCommand = async (packName, account, settings, dispatch) => {
  const instanceConfigJSON = JSON.parse(
    await fs.readFile(path.join(PACKS_PATH, packName, 'config.json'))
  );
  const vanillaJSON = JSON.parse(
    await fs.readFile(
      path.join(
        INSTANCES_PATH,
        'versions',
        instanceConfigJSON.version,
        `${instanceConfigJSON.version}.json`
      )
    )
  );
  const forge = instanceConfigJSON.forgeVersion;
  let forgeJSON = null;
  if (forge !== null) {
    try {
      // Handling legacy GDLauncher instances without the forge- in the name
      forgeJSON = JSON.parse(
        await fs.readFile(
          path.join(META_PATH, 'net.minecraftforge', forge, `${forge}.json`)
        )
      );
    } catch {
      forgeJSON = JSON.parse(
        await fs.readFile(
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

  const javaPath = await dispatch(getJavaPath());
  const dosName =
    os.release().substr(0, 2) === 10
      ? '"-Dos.name=Windows 10" -Dos.version=10.0 '
      : '';
  // It concatenates vanilla and forge libraries. If the instance does not contain forge, it concatenates an empty array
  const libs = await computeVanillaAndForgeLibraries(vanillaJSON, forgeJSON);
  const Arguments = getMCArguments(
    vanillaJSON,
    forgeJSON && JSON.parse(forgeJSON.versionJson),
    packName,
    account
  );
  const mainClass = forge
    ? JSON.parse(forgeJSON.versionJson).mainClass
    : vanillaJSON.mainClass;

  const config = JSON.parse(
    await fs.readFile(path.join(PACKS_PATH, packName, 'config.json'))
  );

  const completeCMD = `

"${javaPath}" ${config.overrideArgs ||
    settings.java.args} -Xmx${instanceConfigJSON.overrideMemory ||
    settings.java.memory}m ${dosName} -Djava.library.path="${path.join(
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
   .join(CLASSPATH_DIVIDER_CHAR)}${CLASSPATH_DIVIDER_CHAR}${`"${path.join(
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
      .replace(account.accessToken, 'HIDDEN_ACCESS_TOKEN')
  );
  return completeCMD.replace(/\n|\r/g, '');
};

const getMCArguments = (vanilla, forge, packName, account) => {
  let Arguments = '';
  if (forge && forge.minecraftArguments) {
    Arguments = forge.minecraftArguments;
  } else if (vanilla.minecraftArguments) {
    // Up to 1.13
    Arguments = vanilla.minecraftArguments;
  } else if (vanilla.arguments) {
    // From 1.13
    const vanillaArguments = vanilla.arguments.game
      .filter(arg => typeof arg === 'string')
      .join(' ');

    const forgeArguments = forge
      ? forge.arguments.game.filter(arg => typeof arg === 'string').join(' ')
      : '';

    Arguments = `${vanillaArguments} ${forgeArguments}`;
  }
  // Replaces the arguments and returns the result
  return Arguments.replace('${auth_player_name}', account.selectedProfile.name)
    .replace('${auth_session}', account.accessToken) // Legacy check for really old versions
    .replace('${game_directory}', `"${path.join(PACKS_PATH, packName)}"`)
    .replace(
      '${game_assets}',
      `"${path.join(
        INSTANCES_PATH,
        'assets',
        vanilla.assets === 'legacy' ? '/virtual/legacy' : ''
      )}"`
    ) // Another check for really old versions
    .replace('${version_name}', forge ? forge.id : vanilla.id)
    .replace(
      '${assets_root}',
      `"${path.join(
        INSTANCES_PATH,
        'assets',
        vanilla.assets === 'legacy' ? '/virtual/legacy' : ''
      )}"`
    )
    .replace('${assets_index_name}', vanilla.assets)
    .replace('${auth_uuid}', account.selectedProfile.id)
    .replace('${auth_access_token}', account.accessToken)
    .replace('${user_properties}', '{}')
    .replace('${user_type}', account.user.legacyUser ? 'legacy' : 'mojang')
    .replace('${version_type}', vanilla.type);
};

export default getStartCommand;
