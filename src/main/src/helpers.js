import path from 'path';
import { app } from 'electron';
import { extractFull } from 'node-7z';
import { promises as fs } from 'fs';
import crypto from 'crypto';
import log from 'electron-log';
import { spawn } from 'child_process';
import makeDir from 'make-dir';
import originalFs from 'original-fs';
import murmur from 'murmur2-calculator';
import { MC_LIBRARIES_URL } from '../../common/utils/constants';
import {
  convertOSToMCFormat,
  mavenToArray,
  removeDuplicates,
  skipLibrary
} from '../../common/utils';
import { downloadFile } from '../../common/utils/downloader';
import { getAddonFile } from '../../common/api';

export const get7zPath = () => {
  const baseDir = path.join(app.getAppPath(), '7z');

  let zipLocationAsar = path.join(baseDir, 'linux', 'x64', '7za');
  if (process.platform === 'darwin') {
    zipLocationAsar = path.join(baseDir, 'mac', '7za');
  }
  if (process.platform === 'win32') {
    zipLocationAsar = path.join(baseDir, 'win', 'x64', '7za.exe');
  }

  return zipLocationAsar;
};

export const extractNatives = async (libraries, instancePath) => {
  const extractLocation = path.join(instancePath, 'natives');
  const sevenZipPath = get7zPath();
  await Promise.all(
    libraries
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

export const librariesMapper = ({ libraries, librariesPath }) => {
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

export const readJarManifest = async (jarPath, sevenZipPath, property) => {
  const list = extractFull(jarPath, '.', {
    $bin: sevenZipPath,
    toStdout: true,
    $cherryPick: 'META-INF/MANIFEST.MF'
  });

  await new Promise((resolve, reject) => {
    list.on('end', () => {
      resolve();
    });
    list.on('error', error => {
      reject(error.stderr);
    });
  });

  if (list.info.has(property)) return list.info.get(property);
  return null;
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

      const sevenZipPath = get7zPath();
      const mainClass = await readJarManifest(
        filePath,
        sevenZipPath,
        'Main-Class'
      );

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

        ps.stdout.on('data', () => {
          // console.log(data.toString());
        });

        ps.stderr.on('data', data => {
          log.error(`Forge patching failed: ${data}`);
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
    await fs.rename(zipPath, tempZipFile);
  } else {
    await fs.copyFile(zipPath, tempZipFile);
  }
  const instanceManifest = path.join(instancePath, 'manifest.json');
  // Wait 500ms to avoid `The process cannot access the file because it is being used by another process.`
  await new Promise(resolve => {
    setTimeout(() => resolve(), 500);
  });
  const extraction = extractFull(tempZipFile, instancePath, {
    $bin: get7zPath(),
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
  const manifest = JSON.parse(await fs.readFile(instanceManifest));
  return manifest;
};

export const downloadAddonZip = async (id, fileId, uid, tempPath) => {
  const { data } = await getAddonFile(id, fileId);
  const instanceManifest = path.join(uid, 'manifest.json');
  const zipFile = path.join(tempPath, 'addon.zip');
  await downloadFile(zipFile, data.downloadUrl);
  // Wait 500ms to avoid `The process cannot access the file because it is being used by another process.`
  await new Promise(resolve => {
    setTimeout(() => resolve(), 500);
  });
  const extraction = extractFull(zipFile, uid, {
    $bin: get7zPath(),
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
  const manifest = JSON.parse(await fs.readFile(instanceManifest));
  return manifest;
};

export const getFileMurmurHash2 = filePath => {
  return new Promise((resolve, reject) => {
    return murmur(filePath).then(v => {
      if (v.toString().length === 0) reject();
      return resolve(v);
    });
  });
};
