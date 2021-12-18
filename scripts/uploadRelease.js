const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const fse = require('fs-extra');
const dotenv = require('dotenv');
const rawChangelog = require('../src/common/modals/ChangeLogs/changeLog');

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

    const getChangelog = logVersion => {
      const finalChangelog = {
        logVersion,
        new: [],
        improvements: [],
        bugfixes: []
      };
      rawChangelog.forEach(i => {
        if (
          i.version === logVersion || // include anyway if selected version
          (i.version.startsWith(logVersion) && // Has to match same version
            i.version.indexOf('-beta') === logVersion.length)
          // if beginning of version matches, make sure there is no sub-version until the beta begins
          // yes, this condition chaos is the best solution I could come up with.
        ) {
          console.log(`Included version ${i.version}`);
          if (i.new) finalChangelog.new.push(...i.new);
          if (i.improvements)
            finalChangelog.improvements.push(...i.improvements);
          if (i.bugfixes) finalChangelog.bugfixes.push(...i.bugfixes);
        }
      });
      if (logVersion && logVersion.indexOf('-beta') === -1) {
        const removeIfBeta = (elem, i, arr) => {
          if (elem.betaOnly) arr.splice(i, 1);
        };
        finalChangelog.new.forEach(removeIfBeta);
        finalChangelog.improvements.forEach(removeIfBeta);
        finalChangelog.bugfixes.forEach(removeIfBeta);
      }
      return finalChangelog;
    };

    const formatChangelog = raw => {
      let changelog = '';
      for (const element in raw) {
        if (raw[element].length) {
          changelog += `### ${element
            .charAt(0)
            .toUpperCase()}${element.substring(1)}\n`;

          for (const e of raw[element]) {
            if (!e?.advanced?.cm || !e?.header || !e?.content) {
              continue;
            }
            const prSplit = e?.advanced?.pr && e?.advanced?.pr.split('/');
            const advanced =
              ` ([${e?.advanced?.cm}](https://github.com/gorilla-devs/GDLauncher/commit/${e?.advanced?.cm})` +
              `${
                prSplit
                  ? ` | [#${e?.advanced.pr}](https://github.com/gorilla-devs/GDLauncher/pull/${prSplit[0]}` +
                    `${prSplit?.[1] ? `/commits/${prSplit[1]}` : ''})`
                  : ''
              })`;
            const notes = `- **${e?.header || ''}** ${e?.content || ''}`;
            changelog += `${notes + advanced} \n`;
          }
        }
      }
      return changelog;
    };

    const { data: newRelease } = await axios.default.post(
      'https://api.github.com/repos/gorilla-devs/GDLauncher/releases',
      {
        tag_name: `v${version}`,
        name: `v${version}`,
        draft: true,
        prerelease: version.includes('beta'),
        body: formatChangelog(getChangelog(version))
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
