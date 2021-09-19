const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const makeDir = require('make-dir');
const { pipeline } = require('stream');
const fse = require('fs-extra');
const electronBuilder = require('electron-builder');
const dotenv = require('dotenv');

dotenv.config();

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const type = process.argv[2];

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

const winReleaseFolder = path.resolve(
  __dirname,
  '../',
  './release',
  `win-unpacked`
);
const deployFolder = path.resolve(__dirname, '../', 'deploy');

const createDeployFiles = async () => {
  const files = await getFiles(winReleaseFolder);
  const mappedFiles = await Promise.all(
    files.map(async v => {
      // Compress
      const hash = await getSha1(v);

      const gzip = zlib.createGzip();
      const source = fs.createReadStream(v);

      const isAppAsar = path.basename(v) === 'app.asar';

      const destinationPath = path.join(
        deployFolder,
        `win_${path.relative(winReleaseFolder, v).replace(path.sep, '-')}.gz`
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
        file: path.relative(winReleaseFolder, v).split(path.sep),
        sha1: hash,
        compressedFile: path.basename(destinationPath),
        compressedSha1,
        ...(isAppAsar && { isAppAsar: true })
      };
    })
  );

  await fs.promises.writeFile(
    path.join(deployFolder, `win32_latest.json`),
    JSON.stringify(mappedFiles)
  );
};

const extraFiles = [];
let sevenZipPath = null;
if (process.platform === 'win32') {
  sevenZipPath = 'node_modules/7zip-bin/win/x64/7za.exe';
  extraFiles.push({
    from: 'vcredist/',
    to: './',
    filter: '**/*'
  });
} else if (process.platform === 'linux') {
  sevenZipPath = 'node_modules/7zip-bin/linux/x64/7za';
} else if (process.platform === 'darwin') {
  sevenZipPath = 'node_modules/7zip-bin/mac/x64/7za';
}

extraFiles.push({
  from: sevenZipPath,
  to: './'
});

const commonConfig = {
  publish: 'never',
  config: {
    generateUpdatesFilesForAllChannels: true,
    npmRebuild: false,
    productName: 'GDLauncher',
    appId: 'org.gorilladevs.GDLauncher',
    files: [
      '!node_modules/**/*',
      'build/**/*',
      'package.json',
      'public/icon.png'
    ],
    extraFiles,
    asar: {
      smartUnpack: false
    },
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
      oneClick: true,
      installerIcon: './public/icon.ico',
      uninstallerIcon: './public/icon.ico',
      installerHeader: './public/installerHeader.bmp',
      installerSidebar: './public/installerSidebar.bmp',
      installerHeaderIcon: './public/icon.ico',
      deleteAppDataOnUninstall: true,
      allowToChangeInstallationDirectory: false,
      perMachine: false,
      differentialPackage: true,
      include: './public/installer.nsh'
    },
    mac: {
      entitlements: './entitlements.mac.plist',
      entitlementsInherit: './entitlements.mac.plist'
    },
    /* eslint-disable */
    artifactName: `${'${productName}'}-${'${os}'}-${
      process.argv[2]
    }.${'${ext}'}`,
    /* eslint-enable */
    linux: {
      category: 'Game',
      icon: 'public/linux-icons/'
    },
    directories: {
      buildResources: 'public',
      output: 'release'
    },
    protocols: [
      {
        name: 'gdlauncher',
        role: 'Viewer',
        schemes: ['gdlauncher']
      }
    ]
  },
  ...(process.platform === 'linux' && {
    linux:
      type === 'setup'
        ? ['appimage:x64', 'zip:x64', 'deb:x64', 'rpm:x64']
        : ['snap:x64']
  }),
  ...(process.platform === 'win32' && {
    win: [type === 'setup' ? 'nsis:x64' : 'zip:x64']
  }),
  ...(process.platform === 'darwin' && {
    mac: type === 'setup' ? ['dmg:x64'] : []
  })
};

const main = async () => {
  const releasesFolder = path.resolve(__dirname, '../', './release');
  await fse.remove(releasesFolder);
  await makeDir(deployFolder);
  await electronBuilder.build(commonConfig);
  if (type === 'portable' && process.platform === 'win32') {
    await createDeployFiles();
  }

  // Copy all other files to deploy folder

  const { productName } = commonConfig.config;

  const allFiles = {
    setup: {
      darwin: [
        `${productName}-mac-${type}.dmg`,
        `${productName}-mac-${type}.dmg.blockmap`,
        'latest-mac.yml'
      ],
      win32: [
        path.join(`${productName}-win-${type}.exe`),
        path.join(`${productName}-win-${type}.exe.blockmap`),
        path.join('latest.yml')
      ],
      linux: [
        `${productName}-linux-${type}.zip`,
        `${productName}-linux-${type}.AppImage`,
        `${productName}-linux-${type}.deb`,
        `${productName}-linux-${type}.rpm`,
        'latest-linux.yml'
      ]
    },
    portable: {
      darwin: [],
      win32: [`${productName}-win-${type}.zip`],
      linux: [`${productName}-linux-${type}.snap`]
    }
  };

  const filesToMove = allFiles[type][process.platform];

  await Promise.all(
    filesToMove.map(async file => {
      const stats = await fs.promises.stat(path.join(releasesFolder, file));
      if (stats.isFile()) {
        await fse.move(
          path.join(releasesFolder, file),
          path.join(deployFolder, file.replace('nsis-web', ''))
        );
      }
    })
  );

  await fse.remove(releasesFolder);
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
