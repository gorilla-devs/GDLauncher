import { promises as fs } from 'fs';
import originalFs from 'original-fs';
import fse from 'fs-extra';
import { extractFull } from 'node-7z';
import jimp from 'jimp/es';
import makeDir from 'make-dir';
import jarAnalyzer from 'jarfile';
import { promisify } from 'util';
import { ipcRenderer } from 'electron';
import path from 'path';
import crypto from 'crypto';
import { exec, spawn } from 'child_process';
import {
  MC_LIBRARIES_URL,
  FABRIC,
  FORGE
} from '../../../common/utils/constants';
import { removeDuplicates } from '../../../common/utils';
import { getAddonFile, mcGetPlayerSkin } from '../../../common/api';
import { downloadFile } from './downloader';

export const isDirectory = source =>
  fs.lstat(source).then(r => r.isDirectory());

export const getDirectories = async source => {
  const dirs = await fs.readdir(source);
  return Promise.all(
    dirs
      .map(name => path.join(source, name))
      .filter(isDirectory)
      .map(dir => path.basename(dir))
  );
};

export const mavenToArray = (s, nativeString, forceExt) => {
  const pathSplit = s.split(':');
  const fileName = pathSplit[3]
    ? `${pathSplit[2]}-${pathSplit[3]}`
    : pathSplit[2];
  const finalFileName = fileName.includes('@')
    ? fileName.replace('@', '.')
    : `${fileName}${nativeString || ''}${forceExt || '.jar'}`;
  const initPath = pathSplit[0]
    .split('.')
    .concat(pathSplit[1])
    .concat(pathSplit[2].split('@')[0])
    .concat(`${pathSplit[1]}-${finalFileName}`);
  return initPath;
};

export const convertOSToMCFormat = ElectronFormat => {
  switch (ElectronFormat) {
    case 'win32':
      return 'windows';
    case 'darwin':
      return 'osx';
    case 'linux':
      return 'linux';
    default:
      return false;
  }
};

export const convertOSToJavaFormat = ElectronFormat => {
  switch (ElectronFormat) {
    case 'win32':
      return 'windows';
    case 'darwin':
      return 'mac';
    case 'linux':
      return 'linux';
    default:
      return false;
  }
};

export const skipLibrary = lib => {
  let skip = false;
  if (lib.rules) {
    skip = true;
    lib.rules.forEach(({ action, os, features }) => {
      if (features) return true;
      if (
        action === 'allow' &&
        ((os && os.name === convertOSToMCFormat(process.platform)) || !os)
      ) {
        skip = false;
      }
      if (
        action === 'disallow' &&
        ((os && os.name === convertOSToMCFormat(process.platform)) || !os)
      ) {
        skip = true;
      }
    });
  }
  return skip;
};

export const librariesMapper = (libraries, librariesPath) => {
  return removeDuplicates(
    libraries
      .filter(v => !skipLibrary(v))
      .reduce((acc, lib) => {
        const tempArr = [];
        // Normal libs
        if (lib.downloads && lib.downloads.artifact) {
          let { url } = lib.downloads.artifact;
          // Handle special case for forge universal where the url is "".
          if (lib.downloads.artifact.url === '') {
            url = `https://files.minecraftforge.net/maven/${mavenToArray(
              lib.name
            ).join('/')}`;
          }
          tempArr.push({
            url,
            path: path.join(librariesPath, lib.downloads.artifact.path),
            sha1: lib.downloads.artifact.sha1
          });
        }

        const native = (
          (lib?.natives &&
            lib?.natives[convertOSToMCFormat(process.platform)]) ||
          ''
        ).replace(
          '${arch}', // eslint-disable-line no-template-curly-in-string
          '64'
        );

        // Vanilla native libs
        if (native && lib?.downloads?.classifiers[native]) {
          tempArr.push({
            url: lib.downloads.classifiers[native].url,
            path: path.join(
              librariesPath,
              lib.downloads.classifiers[native].path
            ),
            sha1: lib.downloads.classifiers[native].sha1,
            natives: true
          });
        }
        if (tempArr.length === 0) {
          tempArr.push({
            url: `${lib.url || `${MC_LIBRARIES_URL}/`}${mavenToArray(
              lib.name,
              native && `-${native}`
            ).join('/')}`,
            path: path.join(librariesPath, ...mavenToArray(lib.name, native)),
            ...(native && { natives: true })
          });
        }
        return acc.concat(tempArr);
      }, []),
    'url'
  );
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

export const get7zPath = async () => {
  // Get userData from ipc because we can't always get this from redux
  const baseDir = await ipcRenderer.invoke('getUserData');
  if (process.platform === 'darwin' || process.platform === 'linux') {
    return path.join(baseDir, '7za');
  }
  return path.join(baseDir, '7za.exe');
};

export const extractNatives = async (libraryJar, extractLocation) => {
  const sevenZipPath = await get7zPath();
  await Promise.all(
    libraryJar
      .filter(l => l.natives)
      .map(async l => {
        const extraction = extractFull(l.path, extractLocation, {
          $bin: sevenZipPath,
          $raw: ['-xr!META-INF']
        });
        await new Promise((resolve, reject) => {
          extraction.on('end', () => {
            resolve();
          });
          extraction.on('error', err => {
            reject(err);
          });
        });
      })
  );
};

export const copyAssetsToResources = async assets => {
  await Promise.all(
    assets.map(async asset => {
      try {
        await fs.access(asset.resourcesPath);
      } catch {
        await makeDir(path.dirname(asset.resourcesPath));
        await fs.copyFile(asset.path, asset.resourcesPath);
      }
    })
  );
};

export const copyAssetsToLegacy = async assets => {
  await Promise.all(
    assets.map(async asset => {
      try {
        await fs.access(asset.legacyPath);
      } catch {
        await makeDir(path.dirname(asset.legacyPath));
        await fs.copyFile(asset.path, asset.legacyPath);
      }
    })
  );
};

const hiddenToken = '__HIDDEN_TOKEN__';
export const getJVMArguments112 = (
  libraries,
  nativeLibs,
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
  args.push(`-Djava.library.path="${nativeLibs}"`);
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
  nativeLibs,
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
            val = args[i].replace(argDiscovery, `"${nativeLibs}"`);
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

export const patchForge113 = async (
  forgeJson,
  mainJar,
  librariesPath,
  javaPath,
  updatePercentage
) => {
  const { processors } = forgeJson;
  const replaceIfPossible = arg => {
    const finalArg = arg.replace('{', '').replace('}', '');
    if (forgeJson.data[finalArg]) {
      // Handle special case
      if (finalArg === 'BINPATCH') {
        return `"${path
          .join(librariesPath, ...mavenToArray(forgeJson.path))
          .replace('.jar', '-clientdata.lzma')}"`;
      }
      // Return replaced string
      return forgeJson.data[finalArg].client;
    }
    // Return original string (checking for MINECRAFT_JAR)
    return arg.replace('{MINECRAFT_JAR}', `"${mainJar}"`);
  };
  const computePathIfPossible = arg => {
    if (arg[0] === '[') {
      return `"${path.join(
        librariesPath,
        ...mavenToArray(arg.replace('[', '').replace(']', ''))
      )}"`;
    }
    return arg;
  };

  let counter = 1;
  /* eslint-disable no-await-in-loop, no-restricted-syntax */
  for (const key in processors) {
    if (Object.prototype.hasOwnProperty.call(processors, key)) {
      const p = processors[key];
      const filePath = path.join(librariesPath, ...mavenToArray(p.jar));
      const args = p.args
        .map(arg => replaceIfPossible(arg))
        .map(arg => computePathIfPossible(arg));

      const classPaths = p.classpath.map(
        cp => `"${path.join(librariesPath, ...mavenToArray(cp))}"`
      );

      const jarFile = await promisify(jarAnalyzer.fetchJarAtPath)(filePath);
      const mainClass = jarFile.valueForManifestEntry('Main-Class');
      await new Promise(resolve => {
        const ps = spawn(
          `"${javaPath}"`,
          [
            '-classpath',
            [`"${filePath}"`, ...classPaths].join(path.delimiter),
            mainClass,
            ...args
          ],
          { shell: true }
        );

        ps.stdout.on('data', data => {
          console.log(data.toString());
        });

        ps.stderr.on('data', data => {
          console.error(`ps stderr: ${data}`);
        });

        ps.on('close', code => {
          if (code !== 0) {
            console.log(`process exited with code ${code}`);
            resolve();
          }
          resolve();
        });
      });
      updatePercentage(counter, processors.length);
      counter += 1;
    }
  }
  /* eslint-enable no-await-in-loop, no-restricted-syntax */
};

export const importAddonZip = async (
  zipPath,
  instancePath,
  instanceTempPath,
  tempPath
) => {
  const tempZipFile = path.join(instanceTempPath, 'addon.zip');
  await makeDir(instanceTempPath);
  if (zipPath.includes(tempPath)) {
    await fse.move(zipPath, tempZipFile);
  } else {
    await fse.copyFile(zipPath, tempZipFile);
  }
  const instanceManifest = path.join(instancePath, 'manifest.json');
  // Wait 500ms to avoid `The process cannot access the file because it is being used by another process.`
  await new Promise(resolve => {
    setTimeout(() => resolve(), 500);
  });
  const sevenZipPath = await get7zPath();
  const extraction = extractFull(tempZipFile, instancePath, {
    $bin: sevenZipPath,
    yes: true,
    $cherryPick: 'manifest.json'
  });
  await new Promise((resolve, reject) => {
    extraction.on('end', () => {
      resolve();
    });
    extraction.on('error', err => {
      reject(err.stderr);
    });
  });
  const manifest = await fse.readJson(instanceManifest);
  return manifest;
};

export const downloadAddonZip = async (id, fileId, instancePath, tempPath) => {
  const { data } = await getAddonFile(id, fileId);
  const instanceManifest = path.join(instancePath, 'manifest.json');
  const zipFile = path.join(tempPath, 'addon.zip');
  await downloadFile(zipFile, data.downloadUrl);
  // Wait 500ms to avoid `The process cannot access the file because it is being used by another process.`
  await new Promise(resolve => {
    setTimeout(() => resolve(), 500);
  });
  const sevenZipPath = await get7zPath();
  const extraction = extractFull(zipFile, instancePath, {
    $bin: sevenZipPath,
    yes: true,
    $cherryPick: 'manifest.json'
  });
  await new Promise((resolve, reject) => {
    extraction.on('end', () => {
      resolve();
    });
    extraction.on('error', err => {
      reject(err.stderr);
    });
  });
  const manifest = await fse.readJson(instanceManifest);
  return manifest;
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

export const normalizeModData = (data, projectID, modName, categorySection) => {
  const temp = data;
  temp.name = modName;
  temp.categorySection = { path: categorySection.path };
  if (data.projectID && data.fileID) return temp;
  if (data.id) {
    temp.projectID = projectID;
    temp.fileID = data.id;
    delete temp.id;
    delete temp.projectId;
    delete temp.fileId;
  }
  return temp;
};

export const reflect = p =>
  p.then(
    v => ({ v, status: true }),
    e => ({ e, status: false })
  );

export const convertCompletePathToInstance = (f, instancesPath) => {
  const escapeRegExp = stringToGoIntoTheRegex => {
    return stringToGoIntoTheRegex.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  };

  return f.replace(new RegExp(escapeRegExp(instancesPath), 'gi'), '');
};

export const isMod = (fileName, instancesPath) =>
  /^(\\|\/)([\w\d-.{}()[\]@#$%^&!\s])+((\\|\/)mods((\\|\/)(.*))(\.jar|\.disabled))$/.test(
    convertCompletePathToInstance(fileName, instancesPath)
  );

export const isInstanceFolderPath = (f, instancesPath) =>
  /^(\\|\/)([\w\d-.{}()[\]@#$%^&!\s])+$/.test(
    convertCompletePathToInstance(f, instancesPath)
  );

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

export const getFirstReleaseCandidate = files => {
  let latestFile = null;
  let counter = 1;
  while (counter <= 3 && !latestFile) {
    const c = counter;
    const latest = files.find(v => v.releaseType === c);
    if (latest) {
      latestFile = latest;
    }
    counter += 1;
  }
  return latestFile;
};

export const getFileHash = async (filePath, algorithm = 'sha1') => {
  // Calculate sha1 on original file
  const shasum = crypto.createHash(algorithm);

  const s = originalFs.ReadStream(filePath);
  s.on('data', data => {
    shasum.update(data);
  });

  const hash = await new Promise(resolve => {
    s.on('end', () => {
      resolve(shasum.digest('hex'));
    });
  });
  return hash;
};

export const getFilesRecursive = async dir => {
  const subdirs = await originalFs.promises.readdir(dir);
  const files = await Promise.all(
    subdirs.map(async subdir => {
      const res = path.resolve(dir, subdir);
      return (await originalFs.promises.stat(res)).isDirectory()
        ? getFilesRecursive(res)
        : res;
    })
  );
  return files.reduce((a, f) => a.concat(f), []);
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
