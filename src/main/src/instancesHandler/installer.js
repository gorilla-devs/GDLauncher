import path from 'path';
import { promises as fs } from 'fs';
import axios from 'axios';
import log from 'electron-log';
import pMap from 'p-map';
import coerce from 'semver/functions/coerce';
import lte from 'semver/functions/lte';
import gt from 'semver/functions/gt';
import fse from 'fs-extra';
import { extractFull, add as sevenAdd, delete as sevenDelete } from 'node-7z';
import EV from '../../../common/messageEvents';
import generateMessageId from '../../../common/utils/generateMessageId';
import {
  DATASTORE_PATH,
  DB_INSTANCE,
  INSTANCES_PATH,
  LIBRARIES_PATH,
  MC_ASSETS_PATH,
  MC_VERSIONS_PATH,
  TEMP_PATH
} from '../config';
import { sendMessage } from '../messageListener';
import {
  getInstanceDB,
  INSTANCES,
  INSTANCES_INSTALL_QUEUE,
  updateInstance
} from './instances';
import { MANIFESTS } from '../manifests';
import getJavaPath from '../java';
import {
  FABRIC,
  FMLLIBS_FORGE_BASE_URL,
  FMLLIBS_OUR_BASE_URL,
  FORGE,
  MC_RESOURCES_URL,
  VANILLA
} from '../../../common/utils/constants';
import {
  downloadFile,
  downloadInstanceFiles
} from '../../../common/utils/downloader';
import {
  copyAssetsToLegacy,
  copyAssetsToResources,
  downloadAddonZip,
  extractNatives,
  get7zPath,
  getFileHash,
  getFilesRecursive,
  importAddonZip,
  librariesMapper,
  patchForge113
} from '../helpers';
import { getAddon, getAddonFile, getFabricJson } from '../../../common/api';
import {
  mavenToArray,
  normalizeModData,
  waitTime
} from '../../../common/utils';
import fmlLibsMapping from '../../../app/desktop/utils/fmllibs';
import { convertcurseForgeToCanonical } from '../../../app/desktop/utils';

export const INSTALL_STATES = {
  DOWNLOADING_GAME_FILES: 'DOWNLOADING_GAME_FILES',
  DOWNLOADING_FABRIC_FILES: 'DOWNLOADING_FABRIC_FILES',
  DOWNLOADING_FORGE_INSTALLER: 'DOWNLOADING_FORGE_INSTALLER',
  DOWNLOADING_FORGE_LIBRARIES: 'DOWNLOADING_FORGE_LIBRARIES',
  PATCHING_FORGE: 'PATCHING_FORGE',
  INJECTING_FORGE: 'INJECTING_FORGE',
  DOWNLOADING_MODS: 'DOWNLOADING_MODS',
  COPYING_OVERRIDES: 'COPYING_OVERRIDES',
  FINALIZING_OVERRIDES: 'FINALIZING_OVERRIDES'
};

export const applyInstall = async ([
  instanceName,
  modloader,
  manifest,
  background,
  uid
]) => {
  const installFunc = () => startInstallation();
  installFunc.config = {
    name: instanceName,
    modloader,
    timePlayed: 0,
    background,
    mods: [],
    overrides: {},
    uid
  };
  installFunc.manifest = manifest;
  sendMessage(
    EV.ADD_INSTALLING_INSTANCE,
    generateMessageId(),
    installFunc.config
  );
  log.log(`Adding ${instanceName} to install queue`);
  sendMessage(
    EV.ADD_SPECIFIC_INSTANCE_QUEUE,
    generateMessageId(),
    installFunc.config
  );
  await INSTANCES_INSTALL_QUEUE.add(installFunc);
  sendMessage(EV.REMOVE_SPECIFIC_INSTANCE_QUEUE, generateMessageId(), uid);
  INSTANCES[uid] = installFunc.config;
  updateInstance(uid);
  if (manifest) {
    getInstanceDB(uid).put(`instances.${uid}.manifest`, manifest);
  }
};

const startInstallation = async () => {
  const { config, manifest } = INSTANCES_INSTALL_QUEUE.queue[0].promise;

  const { name: instanceName, modloader, uid } = config;
  const [, mcVersion] = modloader;
  log.log(`Starting actual installation of ${instanceName}`);

  sendMessage(
    EV.UPDATE_INSTALLATION_STATUS,
    generateMessageId(),
    INSTALL_STATES.DOWNLOADING_GAME_FILES
  );

  // DOWNLOAD MINECRAFT JSON
  let mcJson;
  const mcJsonPath = `mcVersions.jsons.${mcVersion}`;
  try {
    mcJson = await DB_INSTANCE.get(mcJsonPath);
  } catch (err) {
    const versionURL = MANIFESTS.mcVersions.versions.find(
      v => v.id === mcVersion
    ).url;
    mcJson = (await axios.get(versionURL)).data;
    await DB_INSTANCE.put(mcJsonPath, mcJson);
  }

  // COMPUTING MC ASSETS
  let assetsJson;
  const assetsPath = `mcVersions.assets.${mcJson.assets}`;
  try {
    assetsJson = await DB_INSTANCE.get(mcJsonPath);
  } catch (e) {
    assetsJson = (await axios.get(mcJson.assetIndex.url)).data;
    await DB_INSTANCE.put(assetsPath, assetsJson);
  }

  const mcMainFile = {
    url: mcJson.downloads.client.url,
    sha1: mcJson.downloads.client.sha1,
    path: path.join(MC_VERSIONS_PATH, `${mcJson.id}.jar`)
  };

  const assets = Object.entries(assetsJson.objects).map(
    ([assetKey, { hash }]) => ({
      url: `${MC_RESOURCES_URL}/${hash.substring(0, 2)}/${hash}`,
      type: 'asset',
      sha1: hash,
      path: path.join(MC_ASSETS_PATH, 'objects', hash.substring(0, 2), hash),
      resourcesPath: path.join(INSTANCES_PATH, uid, 'resources', assetKey),
      legacyPath: path.join(MC_ASSETS_PATH, 'virtual', 'legacy', assetKey)
    })
  );

  const libraries = librariesMapper({
    libraries: mcJson.libraries,
    librariesPath: LIBRARIES_PATH
  });

  const updatePercentage = downloaded => {
    sendMessage(
      EV.UPDATE_INSTALLATION_PROGRESS,
      generateMessageId(),
      (downloaded * 100) / (assets.length + libraries.length + 1)
    );
  };

  await downloadInstanceFiles(
    [...libraries, ...assets, mcMainFile],
    updatePercentage,
    3
  );

  // Wait 400ms to avoid "The process cannot access the file because it is being used by another process."
  await new Promise(resolve => setTimeout(() => resolve(), 400));

  await extractNatives(libraries, path.join(INSTANCES_PATH, uid));

  if (assetsJson.map_to_resources) {
    await copyAssetsToResources(assets);
  }
  if (mcJson.assets === 'legacy') {
    await copyAssetsToLegacy(assets);
  }

  if (modloader && modloader[0] === FABRIC) {
    await downloadFabric();
  } else if (modloader && modloader[0] === FORGE) {
    await downloadForge();
  }

  if (manifest) {
    await processManifest();
  }
};

const processManifest = async () => {
  const { config, manifest } = INSTANCES_INSTALL_QUEUE.queue[0].promise;

  const { mods, uid } = config;

  sendMessage(
    EV.UPDATE_INSTALLATION_STATUS,
    generateMessageId(),
    INSTALL_STATES.DOWNLOADING_MODS
  );

  let modManifests = [];
  await pMap(
    manifest.files,
    async item => {
      let ok = false;
      let tries = 0;
      /* eslint-disable no-await-in-loop */
      do {
        tries += 1;
        if (tries !== 1) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
        try {
          const { data: addon } = await getAddon(item.projectID);
          const modManifest = (await getAddonFile(item.projectID, item.fileID))
            .data;
          const destFile = path.join(
            INSTANCES_PATH,
            uid,
            addon?.categorySection?.path || 'mods',
            modManifest.fileName
          );
          let fileExists;
          try {
            fileExists = await fs.access(destFile);
          } catch {
            fileExists = false;
          }

          if (!fileExists) {
            await downloadFile(destFile, modManifest.downloadUrl);
          }

          modManifests = modManifests.concat(
            normalizeModData(modManifest, item.projectID, addon.name)
          );

          const percentage =
            (modManifests.length * 100) / manifest.files.length - 1;

          sendMessage(
            EV.UPDATE_INSTALLATION_PROGRESS,
            generateMessageId(),
            percentage > 0 ? percentage : 0
          );

          ok = true;
        } catch (err) {
          console.error(err);
        }
      } while (!ok && tries <= 3);
      /* eslint-enable no-await-in-loop */
    },
    { concurrency: 3 }
  );

  sendMessage(
    EV.UPDATE_INSTALLATION_STATUS,
    generateMessageId(),
    INSTALL_STATES.COPYING_OVERRIDES
  );

  const addonPathZip = path.join(TEMP_PATH, uid, 'addon.zip');
  const sevenZipPath = get7zPath();
  const extraction = extractFull(addonPathZip, path.join(TEMP_PATH, uid), {
    recursive: true,
    $bin: sevenZipPath,
    yes: true,
    $cherryPick: 'overrides',
    $progress: true
  });
  await new Promise((resolve, reject) => {
    let progress = 0;
    extraction.on('progress', ({ percent }) => {
      if (percent !== progress) {
        progress = percent;
        sendMessage(
          EV.UPDATE_INSTALLATION_PROGRESS,
          generateMessageId(),
          percent
        );
      }
    });
    extraction.on('end', () => {
      resolve();
    });
    extraction.on('error', err => {
      reject(err.stderr);
    });
  });

  sendMessage(
    EV.UPDATE_INSTALLATION_STATUS,
    generateMessageId(),
    INSTALL_STATES.FINALIZING_OVERRIDES
  );

  const overrideFiles = await getFilesRecursive(
    path.join(TEMP_PATH, uid, 'overrides')
  );

  mods.push(...modManifests);
  config.overrides = overrideFiles.map(v =>
    path.relative(path.join(TEMP_PATH, uid, 'overrides'), v)
  );

  await Promise.all(
    overrideFiles.map(v => {
      const relativePath = path.relative(
        path.join(TEMP_PATH, uid, 'overrides'),
        v
      );
      const newPath = path.join(INSTANCES_PATH, uid, relativePath);
      return fse.copy(v, newPath, { overwrite: true });
    })
  );

  await fse.remove(addonPathZip);
  await fse.remove(path.join(TEMP_PATH, uid));
};

const downloadForge = async () => {
  const { config } = INSTANCES_INSTALL_QUEUE.queue[0].promise;

  const { modloader, uid } = config;

  const forgeJson = {};
  const forgeJsonPath = `mcVersions.forge.${modloader[2]}`;

  const pre152 = lte(coerce(modloader[1]), coerce('1.5.2'));
  const pre132 = lte(coerce(modloader[1]), coerce('1.3.2'));
  const baseUrl =
    'https://files.minecraftforge.net/maven/net/minecraftforge/forge';
  const tempInstaller = path.join(TEMP_PATH, `${modloader[2]}.jar`);
  const expectedInstaller = path.join(
    DATASTORE_PATH,
    'forgeInstallers',
    `${modloader[2]}.jar`
  );

  const extractSpecificFile = async from => {
    const extraction = extractFull(tempInstaller, TEMP_PATH, {
      $bin: get7zPath(),
      yes: true,
      $cherryPick: from
    });
    await new Promise((resolve, reject) => {
      extraction.on('end', () => {
        resolve();
      });
      extraction.on('error', error => {
        reject(error.stderr);
      });
    });
  };

  try {
    await fs.access(expectedInstaller);
    if (!pre152) {
      await DB_INSTANCE.get(forgeJsonPath);
    }
    const { data: hashes } = await axios.get(
      `https://files.minecraftforge.net/maven/net/minecraftforge/forge/${modloader[2]}/meta.json`
    );
    const fileMd5 = await getFileHash(expectedInstaller, 'md5');
    let expectedMd5 = hashes?.classifiers?.installer?.jar;
    if (pre132) {
      expectedMd5 = hashes?.classifiers?.client?.zip;
    } else if (pre152) {
      expectedMd5 = hashes?.classifiers?.universal?.zip;
    }

    if (fileMd5.toString() !== expectedMd5) {
      throw new Error('Installer hash mismatch');
    }
    await fse.copy(expectedInstaller, tempInstaller, { overwrite: true });
  } catch (err) {
    console.warn(
      'No installer found in temp or hash mismatch. Need to download it.'
    );

    sendMessage(
      EV.UPDATE_INSTALLATION_STATUS,
      generateMessageId(),
      INSTALL_STATES.DOWNLOADING_FORGE_INSTALLER
    );

    let urlTerminal = 'installer.jar';
    if (pre132) {
      urlTerminal = 'client.zip';
    } else if (pre152) {
      urlTerminal = 'universal.zip';
    }

    // Download installer jar and extract stuff
    await downloadFile(
      tempInstaller,
      `${baseUrl}/${modloader[2]}/forge-${modloader[2]}-${urlTerminal}`,
      p => sendMessage(EV.UPDATE_INSTALLATION_PROGRESS, generateMessageId(), p)
    );

    await new Promise(resolve => setTimeout(resolve, 200));
    await fse.copy(tempInstaller, expectedInstaller);
  }

  const installForgePost152 = async () => {
    // Extract version / install json, main jar, universal and client lzma
    await extractSpecificFile('install_profile.json');
    const installerJson = await fse.readJson(
      path.join(TEMP_PATH, 'install_profile.json')
    );

    if (installerJson.install) {
      forgeJson.install = installerJson.install;
      forgeJson.version = installerJson.versionInfo;
    } else {
      forgeJson.install = installerJson;
      await extractSpecificFile(path.basename(installerJson.json));
      forgeJson.version = await fse.readJson(
        path.join(TEMP_PATH, installerJson.json)
      );
      await fse.remove(path.join(TEMP_PATH, installerJson.json));
    }

    await fse.remove(path.join(TEMP_PATH, 'install_profile.json'));

    await DB_INSTANCE.put(forgeJsonPath, forgeJson);

    // Extract forge bin
    if (forgeJson.install.filePath) {
      await extractSpecificFile(forgeJson.install.filePath);

      await fse.move(
        path.join(TEMP_PATH, forgeJson.install.filePath),
        path.join(LIBRARIES_PATH, ...mavenToArray(forgeJson.install.path)),
        { overwrite: true }
      );
    } else {
      // Move all files in maven
      const forgeBinPathInsideZip = path.join(
        'maven',
        path.dirname(path.join(...mavenToArray(forgeJson.install.path)))
      );
      await extractSpecificFile(forgeBinPathInsideZip);

      const filesToMove = await fs.readdir(
        path.join(TEMP_PATH, forgeBinPathInsideZip)
      );
      await Promise.all(
        filesToMove.map(async f => {
          await fse.move(
            path.join(TEMP_PATH, forgeBinPathInsideZip, f),
            path.join(
              LIBRARIES_PATH,
              path.dirname(path.join(...mavenToArray(forgeJson.install.path))),
              path.basename(f)
            ),
            { overwrite: true }
          );
        })
      );

      await fse.remove(path.join(TEMP_PATH, 'maven'));
    }

    sendMessage(
      EV.UPDATE_INSTALLATION_STATUS,
      generateMessageId(),
      INSTALL_STATES.DOWNLOADING_FORGE_LIBRARIES
    );

    let { libraries } = forgeJson.version;

    if (forgeJson.install.libraries) {
      libraries = libraries.concat(forgeJson.install.libraries);
    }

    libraries = librariesMapper({
      libraries: libraries.filter(
        v =>
          !v.name.includes('net.minecraftforge:forge:') &&
          !v.name.includes('net.minecraftforge:minecraftforge:')
      ),
      librariesPath: LIBRARIES_PATH
    });

    const updatePercentage = downloaded => {
      sendMessage(
        EV.UPDATE_INSTALLATION_PROGRESS,
        generateMessageId(),
        (downloaded * 100) / libraries.length
      );
    };

    await downloadInstanceFiles(libraries, updatePercentage, 3);

    // Patching
    if (forgeJson.install?.processors?.length) {
      sendMessage(
        EV.UPDATE_INSTALLATION_STATUS,
        generateMessageId(),
        INSTALL_STATES.PATCHING_FORGE
      );

      // Extract client.lzma from installer

      await extractSpecificFile(path.join('data', 'client.lzma'));

      await fse.move(
        path.join(TEMP_PATH, 'data', 'client.lzma'),
        path.join(
          LIBRARIES_PATH,
          ...mavenToArray(forgeJson.install.path, '-clientdata', '.lzma')
        ),
        { overwrite: true }
      );
      await fse.remove(path.join(TEMP_PATH, 'data'));

      await patchForge113(
        forgeJson.install,
        path.join(MC_VERSIONS_PATH, `${forgeJson.install.minecraft}.jar`),
        LIBRARIES_PATH,
        await getJavaPath(),
        (d, t) =>
          sendMessage(
            EV.UPDATE_INSTALLATION_PROGRESS,
            generateMessageId(),
            (d * 100) / t
          )
      );
    }
  };

  if (gt(coerce(modloader[1]), coerce('1.5.2'))) {
    await installForgePost152();
  } else {
    // Download necessary libs
    const fmllibs = fmlLibsMapping[modloader[1]];
    await pMap(
      fmllibs || [],
      async lib => {
        let ok = false;
        let tries = 0;
        do {
          tries += 1;
          if (tries !== 1) {
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
          try {
            const fileName = path.join(INSTANCES_PATH, uid, 'lib', lib[0]);
            const baseFmlUrl = lib[2]
              ? FMLLIBS_OUR_BASE_URL
              : FMLLIBS_FORGE_BASE_URL;
            const url = `${baseFmlUrl}/${lib[0]}`;
            await downloadFile(fileName, url);
            const fileHash = await getFileHash(fileName);
            if (lib[1] !== fileHash.toString()) {
              throw new Error(`FMLLIB hash mismatch (${lib[0]})`);
            }
            ok = true;
          } catch (err) {
            console.error(err);
          }
        } while (!ok && tries <= 3);
      },
      { concurrency: 3 }
    );

    sendMessage(
      EV.UPDATE_INSTALLATION_STATUS,
      generateMessageId(),
      INSTALL_STATES.INJECTING_FORGE
    );

    sendMessage(EV.UPDATE_INSTALLATION_PROGRESS, generateMessageId(), 0);

    // Perform forge injection
    const mcJarPath = path.join(MC_VERSIONS_PATH, `${modloader[1]}.jar`);
    const mcJarForgePath = path.join(MC_VERSIONS_PATH, `${modloader[2]}.jar`);
    await fse.copy(mcJarPath, mcJarForgePath);

    const metaInfDeletion = sevenDelete(mcJarForgePath, 'META-INF', {
      $bin: get7zPath(),
      yes: true
    });
    await new Promise((resolve, reject) => {
      metaInfDeletion.on('end', () => {
        resolve();
      });
      metaInfDeletion.on('error', error => {
        reject(error.stderr);
      });
    });

    await fse.remove(path.join(TEMP_PATH, modloader[2]));

    // This is garbage, need to use a stream somehow to directly inject data from/to jar
    const extraction = extractFull(
      tempInstaller,
      path.join(TEMP_PATH, modloader[2]),
      {
        $bin: get7zPath(),
        yes: true
      }
    );
    await new Promise((resolve, reject) => {
      extraction.on('end', () => {
        resolve();
      });
      extraction.on('error', error => {
        reject(error.stderr);
      });
    });

    sendMessage(EV.UPDATE_INSTALLATION_PROGRESS, generateMessageId(), 50);

    const updatedFiles = sevenAdd(
      mcJarForgePath,
      `${path.join(TEMP_PATH, modloader[2])}/*`,
      {
        $bin: get7zPath(),
        yes: true
      }
    );
    await new Promise((resolve, reject) => {
      updatedFiles.on('end', () => {
        resolve();
      });
      updatedFiles.on('error', error => {
        reject(error.stderr);
      });
    });

    await fse.remove(path.join(TEMP_PATH, modloader[2]));
  }

  await fse.remove(tempInstaller);
};

const downloadFabric = async () => {
  const { config } = INSTANCES_INSTALL_QUEUE.queue[0].promise;

  const { modloader } = config;

  sendMessage(
    EV.UPDATE_INSTALLATION_STATUS,
    generateMessageId(),
    INSTALL_STATES.DOWNLOADING_FABRIC_FILES
  );

  let fabricJson;
  const fabricJsonPath = path.join(
    LIBRARIES_PATH,
    'net',
    'fabricmc',
    modloader[1],
    modloader[2],
    'fabric.json'
  );
  try {
    fabricJson = await fse.readJson(fabricJsonPath);
  } catch (err) {
    fabricJson = (await getFabricJson(modloader)).data;
    await fse.outputJson(fabricJsonPath, fabricJson);
  }

  const libraries = librariesMapper({
    libraries: fabricJson.libraries,
    librariesPath: LIBRARIES_PATH
  });

  const updatePercentage = downloaded => {
    sendMessage(
      EV.UPDATE_INSTALLATION_PROGRESS,
      generateMessageId(),
      (downloaded * 100) / libraries.length
    );
  };

  await downloadInstanceFiles(libraries, updatePercentage, 3);
};

export const changeModpackVersion = async ([uid, newModpackData]) => {
  const instance = INSTANCES[uid];
  const instancePath = path.join(INSTANCES_PATH, uid);

  const { data: addon } = await getAddon(instance.modloader[3]);

  const manifest = await fse.readJson(path.join(instancePath, 'manifest.json'));

  await fse.remove(path.join(instancePath, 'manifest.json'));

  // Delete prev overrides
  await Promise.all(
    (instance?.overrides || []).map(async v => {
      try {
        await fs.stat(path.join(instancePath, v));
        await fse.remove(path.join(instancePath, v));
      } catch {
        // Swallow error
      }
    })
  );

  const modsProjectIDs = (manifest?.files || []).map(v => v?.projectID);

  delete INSTANCES[uid].overrides;
  INSTANCES[uid].mods = INSTANCES[uid].mods.filter(
    v => !modsProjectIDs.includes(v?.projectID)
  );
  updateInstance(uid);

  await Promise.all(
    modsProjectIDs.map(async projectID => {
      const modFound = instance.mods?.find(v => v?.projectID === projectID);
      if (modFound?.fileName) {
        try {
          await fs.stat(path.join(instancePath, 'mods', modFound?.fileName));
          await fse.remove(path.join(instancePath, 'mods', modFound?.fileName));
        } catch {
          // Swallow error
        }
      }
    })
  );

  const imageURL = addon?.attachments?.find(v => v.isDefault)?.thumbnailUrl;

  const newManifest = await downloadAddonZip(
    instance.modloader[3],
    newModpackData.id,
    path.join(INSTANCES_PATH, uid),
    path.join(TEMP_PATH, uid)
  );

  await downloadFile(
    path.join(INSTANCES_PATH, uid, `background${path.extname(imageURL)}`),
    imageURL
  );

  const modloader = [
    instance.modloader[0],
    newManifest.minecraft.version,
    convertcurseForgeToCanonical(
      newManifest.minecraft.modLoaders.find(v => v.primary).id,
      newManifest.minecraft.version,
      MANIFESTS.forge
    ),
    instance.modloader[3],
    newModpackData.id
  ];
  await applyInstall([
    uid,
    modloader,
    newManifest,
    `background${path.extname(imageURL)}`
  ]);
};

export const installInstance = async ([
  instanceName,
  version,
  modpack,
  importZipPath
]) => {
  const uid = Date.now();
  const isVanilla = version[0] === VANILLA;
  const isFabric = version[0] === FABRIC;
  const isForge = version[0] === FORGE;
  const isTwitchModpack = Boolean(modpack?.attachments);
  const imageURL = modpack?.attachments?.find(v => v.isDefault)?.thumbnailUrl;
  let manifest;
  if (isTwitchModpack) {
    if (importZipPath) {
      manifest = await importAddonZip(
        importZipPath,
        path.join(INSTANCES_PATH, uid),
        path.join(TEMP_PATH, uid),
        TEMP_PATH
      );
    } else {
      manifest = await downloadAddonZip(
        version[1],
        version[2],
        path.join(INSTANCES_PATH, uid),
        path.join(TEMP_PATH, uid)
      );
    }
    await downloadFile(
      path.join(INSTANCES_PATH, uid, `background${path.extname(imageURL)}`),
      imageURL
    );
    if (version[0] === FORGE) {
      const modloader = [
        version[0],
        manifest.minecraft.version,
        convertcurseForgeToCanonical(
          manifest.minecraft.modLoaders.find(v => v.primary).id,
          manifest.minecraft.version,
          MANIFESTS.forge
        ),
        version[1],
        version[2]
      ];
      applyInstall([
        instanceName,
        modloader,
        manifest,
        `background${path.extname(imageURL)}`,
        uid
      ]);
    } else if (version[0] === FABRIC) {
      const modloader = [
        version[0],
        manifest.minecraft.version,
        manifest.minecraft.modLoaders[0].yarn,
        manifest.minecraft.modLoaders[0].loader,
        version[1],
        version[2]
      ];
      applyInstall([
        instanceName,
        modloader,
        manifest,
        `background${path.extname(imageURL)}`,
        uid
      ]);
    } else if (version[0] === VANILLA) {
      const modloader = [
        version[0],
        manifest.minecraft.version,
        version[1],
        version[2]
      ];
      applyInstall([
        instanceName,
        modloader,
        manifest,
        `background${path.extname(imageURL)}`,
        uid
      ]);
    }
  } else if (importZipPath) {
    manifest = await importAddonZip(
      importZipPath,
      path.join(INSTANCES_PATH, uid),
      path.join(TEMP_PATH, uid),
      TEMP_PATH
    );

    if (version[0] === FORGE) {
      const modloader = [
        version[0],
        manifest.minecraft.version,
        convertcurseForgeToCanonical(
          manifest.minecraft.modLoaders.find(v => v.primary).id,
          manifest.minecraft.version,
          MANIFESTS.forge
        )
      ];
      applyInstall([
        instanceName,
        modloader,
        manifest,
        `background${path.extname(imageURL)}`,
        uid
      ]);
    } else if (version[0] === FABRIC) {
      const modloader = [
        version[0],
        manifest.minecraft.version,
        manifest.minecraft.modLoaders[0].yarn,
        manifest.minecraft.modLoaders[0].loader
      ];
      applyInstall([
        instanceName,
        modloader,
        manifest,
        `background${path.extname(imageURL)}`,
        uid
      ]);
    } else if (version[0] === VANILLA) {
      const modloader = [version[0], manifest.minecraft.version];
      applyInstall([
        instanceName,
        modloader,
        manifest,
        `background${path.extname(imageURL)}`,
        uid
      ]);
    }
  } else if (isVanilla) {
    applyInstall([instanceName, [version[0], version[2]], uid]);
    await waitTime(2);
  } else if (isFabric) {
    applyInstall([instanceName, [FABRIC, version[2], version[3]], uid]);
    await waitTime(2);
  } else if (isForge) {
    applyInstall([instanceName, version, uid]);
    await waitTime(2);
  }
};
