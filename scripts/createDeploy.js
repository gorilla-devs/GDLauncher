const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const makeDir = require('make-dir');
const { pipeline } = require('stream');
const fse = require('fs-extra');
const electronBuilder = require('electron-builder');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const getFiles = async dir => {
  const subdirs = await readdir(dir);
  const files = await Promise.all(
    subdirs.map(async subdir => {
      const res = path.resolve(dir, subdir);
      return (await stat(res)).isDirectory() ? getFiles(res) : res;
    })
  );
  return files.reduce((a, f) => a.concat(f), []);
};

const getSha1 = async filePath => {
  // Calculate sha1 on original file
  const algorithm = 'sha1';
  const shasum = crypto.createHash(algorithm);

  const s = fs.ReadStream(filePath);
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

const osMap = {
  win32: 'win',
  darwin: 'mac',
  linux: 'linux'
};

const releaseFolder = path.resolve(
  __dirname,
  '../',
  './release',
  `${osMap[process.platform]}-unpacked`
);
const deployFolder = path.resolve(__dirname, '../', 'deploy');

const createDeployFiles = async type => {
  const files = await getFiles(releaseFolder);
  const mappedFiles = await Promise.all(
    files.map(async v => {
      // Compress
      const hash = await getSha1(v);

      const gzip = zlib.createGzip();
      const source = fs.createReadStream(v);

      const isAppAsar = path.basename(v) === 'app.asar';

      const preFix = isAppAsar ? `${type}_` : '';

      const destinationPath = path.join(
        deployFolder,
        `${preFix}${process.platform}_${path
          .relative(releaseFolder, v)
          .replace(path.sep, '-')}.gz`
      );
      await makeDir(path.dirname(destinationPath));
      const destination = fs.createWriteStream(destinationPath);

      await new Promise((resolve, reject) => {
        pipeline(source, gzip, destination, err => {
          if (err) {
            reject();
          }
          resolve();
        });
      });

      const compressedSha1 = await getSha1(destinationPath);

      return {
        file: path.relative(releaseFolder, v).split(path.sep),
        sha1: hash,
        compressedFile: path.basename(destinationPath),
        compressedSha1,
        ...(isAppAsar && { isAppAsar: true, type })
      };
    })
  );

  let prevFiles = [];

  try {
    prevFiles = (
      await fse.readJson(
        path.join(deployFolder, `${process.platform}_latest.json`)
      )
    ).files.filter(v => !mappedFiles.find(k => k.sha1 === v.sha1));
  } catch {
    // Do nothing
  }

  await fs.promises.writeFile(
    path.join(deployFolder, `${process.platform}_latest.json`),
    JSON.stringify([...mappedFiles, ...prevFiles])
  );
};

const commonConfig = {
  config: {
    publish: {
      owner: 'gorilla-devs',
      repo: 'GDLauncher-Releases',
      provider: 'github',
      private: false
    },
    productName: 'GDLauncher',
    appId: 'org.gorilladevs.GDLauncher',
    files: [
      '!node_modules/**/*',
      'build/**/*',
      'package.json',
      'public/icon.png'
    ],
    dmg: {
      contents: [
        {
          x: 130,
          y: 220
        },
        {
          x: 410,
          y: 220,
          type: 'link',
          path: '/Applications'
        }
      ]
    },
    nsisWeb: {
      oneClick: false,
      installerIcon: './public/icon.ico',
      uninstallerIcon: './public/icon.ico',
      installerHeader: './public/installerHeader.bmp',
      installerSidebar: './public/installerSidebar.bmp',
      installerHeaderIcon: './public/icon.ico',
      deleteAppDataOnUninstall: true,
      allowToChangeInstallationDirectory: true,
      perMachine: true,
      differentialPackage: true,
      include: './public/installer.nsh'
    },
    /* eslint-disable */
    artifactName: `${'${productName}'}-${'${platform}'}-${
      process.argv[2]
    }.${'${ext}'}`,
    /* eslint-enable */
    mac: {
      target: ['dmg']
    },
    win: {
      target: ['nsis-web', 'zip']
    },
    linux: {
      target: ['appImage', 'zip'],
      category: 'Game'
    },
    directories: {
      buildResources: 'public',
      output: 'release'
    }
  },
  linux: ['appimage:x64', 'zip:x64'],
  win: ['nsis-web:x64', 'zip:x64'],
  mac: ['dmg:x64']
};

const main = async () => {
  const type = process.argv[2];
  if (process.platform === 'darwin' && type === 'portable') {
    return null;
  }

  const releasesFolder = path.resolve(__dirname, '../', './release');
  await fse.remove(releasesFolder);
  await makeDir(deployFolder);
  await electronBuilder.build(commonConfig);
  if (process.platform !== 'darwin') {
    await createDeployFiles(type);
  }

  // Copy all other files to deploy folder

  const { productName } = commonConfig.config;

  const { version } = await fse.readJson(
    path.resolve(__dirname, '../', 'package.json')
  );

  const nsisWeb7z = `${productName}-${version}-${process.arch}.nsis.7z`;
  const nameTemplate = `${productName}-${process.platform}-${type}`;

  const allFiles = {
    setup: {
      darwin: [
        `${nameTemplate}.dmg`,
        `${nameTemplate}.dmg.blockmap`,
        'latest-mac.yml'
      ],
      win32: [
        path.join('nsis-web', `${nameTemplate}.exe`),
        path.join('nsis-web', nsisWeb7z),
        path.join('nsis-web', 'latest.yml')
      ],
      linux: [`${nameTemplate}.AppImage`, 'latest-linux.yml']
    },
    portable: {
      darwin: [],
      win32: [`${nameTemplate}.zip`],
      linux: [`${nameTemplate}.zip`]
    }
  };

  const filesToMove = allFiles[type];

  await Promise.all(
    Object.values(filesToMove).map(target =>
      target.map(async file => {
        const stats = await fs.promises.stat(path.join(releasesFolder, file));
        if (stats.isFile()) {
          await fse.move(
            path.join(releasesFolder, file),
            path.join(deployFolder, file.replace('nsis-web', ''))
          );
        }
      })
    )
  );

  await fse.remove(releasesFolder);
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
