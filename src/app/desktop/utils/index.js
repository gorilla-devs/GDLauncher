import { promises as fs } from 'fs';
import jimp from 'jimp/es';
import { promisify } from 'util';
import path from 'path';
import { exec } from 'child_process';
import { FABRIC, FORGE } from '../../../common/utils/constants';

import {
  convertOSToJavaFormat,
  skipLibrary,
  sortByForgeVersionDesc
} from '../../../common/utils';
import { mcGetPlayerSkin } from '../../../common/api';

export const getFilteredVersions = (
  vanillaManifest,
  forgeManifest,
  fabricManifest
) => {
  const versions = [
    {
      value: 'vanilla',
      label: 'Vanilla',
      children: [
        {
          value: 'release',
          label: 'Releases',
          children: vanillaManifest.versions
            .filter(v => v.type === 'release')
            .map(v => ({
              value: v.id,
              label: v.id
            }))
        },
        {
          value: 'snapshot',
          label: 'Snapshots',
          children: vanillaManifest.versions
            .filter(v => v.type === 'snapshot')
            .map(v => ({
              value: v.id,
              label: v.id
            }))
        },
        {
          value: 'old_beta',
          label: 'Old Beta',
          children: vanillaManifest.versions
            .filter(v => v.type === 'old_beta')
            .map(v => ({
              value: v.id,
              label: v.id
            }))
        },
        {
          value: 'old_alpha',
          label: 'Old Alpha',
          children: vanillaManifest.versions
            .filter(v => v.type === 'old_alpha')
            .map(v => ({
              value: v.id,
              label: v.id
            }))
        }
      ]
    },
    {
      value: 'forge',
      label: 'Forge',
      children: Object.entries(forgeManifest).map(([k, v]) => ({
        value: k,
        label: k,
        children: v.sort(sortByForgeVersionDesc).map(child => ({
          value: child,
          label: child.split('-')[1]
        }))
      }))
    },
    {
      value: 'fabric',
      label: 'Fabric',
      children: [
        {
          value: 'release',
          label: 'Releases',
          children: fabricManifest.game
            .filter(v => v.stable)
            .map(v => ({
              value: v.version,
              label: v.version,
              children: fabricManifest.loader.map(c => ({
                value: c.version,
                label: c.version
              }))
            }))
        },
        {
          value: 'snapshot',
          label: 'Snapshots',
          children: fabricManifest.game
            .filter(v => !v.stable)
            .map(v => ({
              value: v.version,
              label: v.version,
              children: fabricManifest.loader.map(c => ({
                value: c.version,
                label: c.version
              }))
            }))
        }
      ]
    }
  ];
  return versions;
};

export const isLatestJavaDownloaded = async (meta, userData, retry) => {
  const javaOs = convertOSToJavaFormat(process.platform);
  const javaMeta = meta.find(v => v.os === javaOs);
  const javaFolder = path.join(
    userData,
    'java',
    javaMeta.version_data.openjdk_version
  );
  // Check if it's downloaded, if it's latest version and if it's a valid download
  let isValid = true;

  const javaExecutable = path.join(
    javaFolder,
    'bin',
    `java${javaOs === 'windows' ? '.exe' : ''}`
  );
  try {
    await fs.access(javaFolder);
    await promisify(exec)(`"${javaExecutable}" -version`);
  } catch (err) {
    console.log(err);

    if (retry) {
      if (process.platform !== 'win32') {
        try {
          await promisify(exec)(`chmod +x "${javaExecutable}"`);
          await promisify(exec)(`chmod 755 "${javaExecutable}"`);
        } catch {
          // swallow error
        }
      }

      return isLatestJavaDownloaded(meta, userData);
    }

    isValid = false;
  }
  return isValid;
};

const hiddenToken = '__HIDDEN_TOKEN__';
export const getJVMArguments112 = (
  libraries,
  mcjar,
  instancePath,
  assetsPath,
  mcJson,
  account,
  memory,
  resolution,
  hideAccessToken,
  jvmOptions = []
) => {
  const args = [];
  args.push('-cp');

  args.push(
    [...libraries, mcjar]
      .filter(l => !l.natives)
      .map(l => `"${l.path}"`)
      .join(process.platform === 'win32' ? ';' : ':')
  );

  // if (process.platform === "darwin") {
  //   args.push("-Xdock:name=instancename");
  //   args.push("-Xdock:icon=instanceicon");
  // }

  args.push(`-Xmx${memory}m`);
  args.push(`-Xms${memory}m`);
  args.push(...jvmOptions);
  args.push(`-Djava.library.path="${path.join(instancePath, 'natives')}"`);
  args.push(`-Dminecraft.applet.TargetDirectory="${instancePath}"`);

  args.push(mcJson.mainClass);
  if (resolution) {
    args.push(`--width ${resolution.width}`);
    args.push(`--height ${resolution.height}`);
  }

  const mcArgs = mcJson.minecraftArguments.split(' ');
  const argDiscovery = /\${*(.*)}/;

  for (let i = 0; i < mcArgs.length; i += 1) {
    if (argDiscovery.test(mcArgs[i])) {
      const identifier = mcArgs[i].match(argDiscovery)[1];
      let val = null;
      switch (identifier) {
        case 'auth_player_name':
          val = account.selectedProfile.name.trim();
          break;
        case 'version_name':
          val = mcJson.id;
          break;
        case 'game_directory':
          val = `"${instancePath}"`;
          break;
        case 'assets_root':
          val = `"${assetsPath}"`;
          break;
        case 'game_assets':
          val = `"${path.join(assetsPath, 'virtual', 'legacy')}"`;
          break;
        case 'assets_index_name':
          val = mcJson.assets;
          break;
        case 'auth_uuid':
          val = account.selectedProfile.id.trim();
          break;
        case 'auth_access_token':
          val = hideAccessToken ? hiddenToken : account.accessToken;
          break;
        case 'auth_session':
          val = hideAccessToken ? hiddenToken : account.accessToken;
          break;
        case 'user_type':
          val = 'mojang';
          break;
        case 'version_type':
          val = mcJson.type;
          break;
        case 'user_properties':
          val = '{}';
          break;
        default:
          break;
      }
      if (val != null) {
        mcArgs[i] = val;
      }
    }
  }

  args.push(...mcArgs);

  return args;
};

export const getJVMArguments113 = (
  libraries,
  mcjar,
  instancePath,
  assetsPath,
  mcJson,
  account,
  memory,
  resolution,
  hideAccessToken,
  jvmOptions = []
) => {
  const argDiscovery = /\${*(.*)}/;
  let args = mcJson.arguments.jvm.filter(v => !skipLibrary(v));

  // if (process.platform === "darwin") {
  //   args.push("-Xdock:name=instancename");
  //   args.push("-Xdock:icon=instanceicon");
  // }

  args.push(`-Xmx${memory}m`);
  args.push(`-Xms${memory}m`);
  args.push(`-Dminecraft.applet.TargetDirectory="${instancePath}"`);
  args.push(...jvmOptions);

  args.push(mcJson.mainClass);

  if (resolution) {
    args.push(`--width ${resolution.width}`);
    args.push(`--height ${resolution.height}`);
  }

  args.push(...mcJson.arguments.game.filter(v => !skipLibrary(v)));

  for (let i = 0; i < args.length; i += 1) {
    if (typeof args[i] === 'object' && args[i].rules) {
      if (typeof args[i].value === 'string') {
        args[i] = `"${args[i].value}"`;
      } else if (typeof args[i].value === 'object') {
        args.splice(i, 1, ...args[i].value.map(v => `"${v}"`));
      }
      i -= 1;
    } else if (typeof args[i] === 'string') {
      if (argDiscovery.test(args[i])) {
        const identifier = args[i].match(argDiscovery)[1];
        let val = null;
        switch (identifier) {
          case 'auth_player_name':
            val = account.selectedProfile.name.trim();
            break;
          case 'version_name':
            val = mcJson.id;
            break;
          case 'game_directory':
            val = `"${instancePath}"`;
            break;
          case 'assets_root':
            val = `"${assetsPath}"`;
            break;
          case 'assets_index_name':
            val = mcJson.assets;
            break;
          case 'auth_uuid':
            val = account.selectedProfile.id.trim();
            break;
          case 'auth_access_token':
            val = hideAccessToken ? hiddenToken : account.accessToken;
            break;
          case 'user_type':
            val = 'mojang';
            break;
          case 'version_type':
            val = mcJson.type;
            break;
          case 'resolution_width':
            val = 800;
            break;
          case 'resolution_height':
            val = 600;
            break;
          case 'natives_directory':
            val = args[i].replace(
              argDiscovery,
              `"${path.join(instancePath, 'natives')}"`
            );
            break;
          case 'launcher_name':
            val = args[i].replace(argDiscovery, 'GDLauncher');
            break;
          case 'launcher_version':
            val = args[i].replace(argDiscovery, '1.0');
            break;
          case 'classpath':
            val = [...libraries, mcjar]
              .filter(l => !l.natives)
              .map(l => `"${l.path}"`)
              .join(process.platform === 'win32' ? ';' : ':');
            break;
          default:
            break;
        }
        if (val !== null) {
          args[i] = val;
        }
      }
    }
  }

  args = args.filter(arg => {
    return arg != null;
  });

  return args;
};

export const getPlayerSkin = async uuid => {
  const playerSkin = await mcGetPlayerSkin(uuid);
  const { data } = playerSkin;
  const base64 = data.properties[0].value;
  const decoded = JSON.parse(Buffer.from(base64, 'base64').toString());
  return decoded?.textures?.SKIN?.url;
};

export const extractFace = async buffer => {
  const image = await jimp.read(buffer);
  image.crop(8, 8, 8, 8);
  image.scale(10, jimp.RESIZE_NEAREST_NEIGHBOR);
  const imageBuffer = await image.getBufferAsync(jimp.MIME_PNG);
  return imageBuffer.toString('base64');
};

export const isFileModFabric = file => {
  return (
    (file.gameVersion.includes('Fabric') ||
      file.modules.find(v => v.foldername === 'fabric.mod.json')) &&
    !file.gameVersion.includes('Forge')
  );
};

export const filterFabricFilesByVersion = (files, version) => {
  return files.filter(v => {
    if (Array.isArray(v.gameVersion)) {
      return v.gameVersion.includes(version) && isFileModFabric(v);
    }
    return v.gameVersion === version;
  });
};

export const filterForgeFilesByVersion = (files, version) => {
  return files.filter(v => {
    if (Array.isArray(v.gameVersion)) {
      return v.gameVersion.includes(version) && !isFileModFabric(v);
    }
    return v.gameVersion === version;
  });
};

export const getFirstPreferredCandidate = (files, release) => {
  let counter = release || 1;

  let latestFile = null;
  while (counter <= 3 && !latestFile) {
    const c = counter;
    const latest = files.find(v => v.releaseType <= c);
    if (latest) {
      latestFile = latest;
    }
    counter += 1;
  }
  return latestFile;
};

export const convertcurseForgeToCanonical = (
  curseForge,
  mcVersion,
  forgeManifest
) => {
  const patchedCurseForge = curseForge.replace('forge-', '');
  const forgeEquivalent = forgeManifest[mcVersion].find(v => {
    return v.split('-')[1] === patchedCurseForge;
  });
  return forgeEquivalent;
};

export const getPatchedInstanceType = instance => {
  const isForge = instance.modloader[0] === FORGE;
  const hasJumpLoader = (instance.mods || []).find(v => v.projectID === 361988);
  if (isForge && !hasJumpLoader) {
    return FORGE;
  }
  return FABRIC;
};
