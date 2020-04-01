const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const fse = require('fs-extra');
const pMap = require('p-map');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const deployFolder = path.resolve(__dirname, '../', 'deploy');

const main = async () => {
  if (!process.argv[2]) {
    console.warn('Skipping release upload. No auth token provided');
    return;
  }
  const { version } = await fse.readJson(
    path.resolve(__dirname, '../', 'package.json')
  );

  let data = null;

  try {
    data = (
      await axios.default.get(
        `https://api.github.com/repos/gorilla-devs/GDLauncher-Releases/releases/tags/v${version}`
      )
    ).data;
  } catch {
    data = (
      await axios.default.post(
        'https://api.github.com/repos/gorilla-devs/GDLauncher-Releases/releases',
        { tag_name: `v${version}`, name: `v${version}`, draft: true },
        {
          headers: {
            Authorization: `token ${process.argv[2]}`
          }
        }
      )
    ).data;
  }

  const deployFiles = await readdir(deployFolder);
  let uploaded = 0;
  await pMap(
    deployFiles,
    async file => {
      const uploadUrl = data.upload_url.replace(
        '{?name,label}',
        `?name=${file}`
      );
      const stats = await stat(path.join(deployFolder, file));
      const buffer = await fs.promises.readFile(path.join(deployFolder, file));

      let contentType = null;

      switch (path.extname(file)) {
        case '.gz':
          contentType = 'application/gzip';
          break;
        case '.zip':
          contentType = 'application/zip';
          break;
        case '.json':
          contentType = 'application/json';
          break;
        default:
          contentType = 'application/octet-stream';
      }

      try {
        await axios.default.post(uploadUrl, buffer, {
          headers: {
            'Content-Length': stats.size,
            'Content-Type': contentType,
            Authorization: `token ${process.argv[2]}`
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        });
      } catch (err) {
        console.log(err);
      }
      uploaded += 1;
      console.log(`Uploaded ${uploaded} / ${deployFiles.length} -- ${file}`);
    },
    { concurrency: 5 }
  );
};

main();
