const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const fse = require('fs-extra');
const dotenv = require('dotenv');

dotenv.config();

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const deployFolder = path.resolve(__dirname, '../', 'deploy');

const main = async () => {
  if (!process.env.GH_ACCESS_TOKEN_RELEASES) {
    console.warn('Cannot upload artifacts. No auth token provided');
    return;
  }
  const { version } = await fse.readJson(
    path.resolve(__dirname, '../', 'package.json')
  );

  let uploadUrl = null;

  try {
    const { data: releasesList } = await axios.default.get(
      `https://api.github.com/repos/gorilla-devs/GDLauncher/releases`,
      {
        headers: {
          Authorization: `token ${process.env.GH_ACCESS_TOKEN_RELEASES}`
        }
      }
    );

    const lastRelease = releasesList.find(v => v.tag_name === `v${version}`);

    if (lastRelease) {
      uploadUrl = lastRelease.upload_url;
      console.log('Found a release with this tag. Uploading there.');
    } else {
      throw new Error('Could not find release. Creating one.');
    }
  } catch (err) {
    console.log(err);
    const { data: newRelease } = await axios.default.post(
      'https://api.github.com/repos/gorilla-devs/GDLauncher/releases',
      {
        tag_name: `v${version}`,
        name: `v${version}`,
        draft: true,
        prerelease: version.includes('beta')
      },
      {
        headers: {
          Authorization: `token ${process.env.GH_ACCESS_TOKEN_RELEASES}`
        }
      }
    );
    uploadUrl = newRelease.upload_url;
    console.log('New release tag created.');
  }

  const deployFiles = await readdir(deployFolder);

  console.log(`Found ${deployFiles.length} files to upload.`);
  let uploaded = 0;
  for (const file of deployFiles) {
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
          Authorization: `token ${process.env.GH_ACCESS_TOKEN_RELEASES}`
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
    } catch (err) {
      console.error(err.message);
      throw err;
    }
    uploaded += 1;
    console.log(`Uploaded ${uploaded} / ${deployFiles.length} -- ${file}`);
  }
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
