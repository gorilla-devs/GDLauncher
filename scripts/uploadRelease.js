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
  console.log('Considering upload.');

  console.log(await readdir(deployFolder));

  if (!process.env.ACCESS_TOKEN) {
    console.warn('Skipping release upload. No auth token provided');
    return;
  }
  const { version } = await fse.readJson(
    path.resolve(__dirname, '../', 'package.json')
  );

  let uploadUrl = null;

  try {
    const { data: releasesList } = await axios.default.get(
      `https://api.github.com/repos/gorilla-devs/GDLauncher-Releases/releases`,
      {
        headers: {
          Authorization: `token ${process.env.ACCESS_TOKEN}`
        }
      }
    );

    const lastRelease = releasesList.find(v => v.tag_name === `v${version}`);

    if (lastRelease) {
      uploadUrl = lastRelease.upload_url;
    } else {
      throw new Error();
    }
  } catch (err) {
    const { data: newRelease } = await axios.default.post(
      'https://api.github.com/repos/gorilla-devs/GDLauncher-Releases/releases',
      { tag_name: `v${version}`, name: `v${version}`, draft: true },
      {
        headers: {
          Authorization: `token ${process.env.ACCESS_TOKEN}`
        }
      }
    );
    uploadUrl = newRelease.upload_url;
  }

  const deployFiles = await readdir(deployFolder);
  let uploaded = 0;
  await pMap(
    deployFiles,
    async file => {
      const fileUploadUrl = uploadUrl.replace('{?name,label}', `?name=${file}`);
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
        await axios.default.post(fileUploadUrl, buffer, {
          headers: {
            'Content-Length': stats.size,
            'Content-Type': contentType,
            Authorization: `token ${process.env.ACCESS_TOKEN}`
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
