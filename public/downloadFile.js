import makeDir from 'make-dir';
import fss from 'fs';
import axios from 'axios';
import pMap from 'p-map';
import path from 'path';
import adapter from 'axios/lib/adapters/http';

const fs = fss.promises;

function getUri(url) {
  return new URL(url).href;
}

export const downloadInstanceFiles = async (
  mainWindow,
  arr,
  updatePercentage,
  threads = 4
) => {
  let downloaded = 0;
  await pMap(
    arr,
    async item => {
      let counter = 0;
      let res = false;
      if (!item.path || !item.url) {
        console.warn('Skipping', item);
        return;
      }
      do {
        counter += 1;
        if (counter !== 1) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }

        try {
          res = await downloadFileInstance(
            item.path,
            item.url,
            item.sha1,
            item.legacyPath
          );
        } catch {
          // Do nothing
        }
      } while (!res && counter < 3);
      downloaded += 1;
      if (
        updatePercentage &&
        (downloaded % 5 === 0 || downloaded === arr.length)
      ) {
        mainWindow.webContents.send(
          'download-instance-files-progress',
          downloaded
        );
      }
    },
    { concurrency: threads }
  );
};

const computeFileHash = (filePath, algorithm = 'sha1') =>
  new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm);
    fs.createReadStream(filePath)
      .on('data', data => hash.update(data))
      .on('end', () => resolve(hash.digest('hex')))
      .on('error', reject);
  });

const downloadFileInstance = async (fileName, url, sha1, legacyPath) => {
  let encodedUrl;
  try {
    const filePath = path.dirname(fileName);
    try {
      await fs.access(fileName);
      if (legacyPath) await fs.access(legacyPath);
      const checksum = await computeFileHash(fileName);
      const legacyChecksum = legacyPath && (await computeFileHash(legacyPath));
      if (checksum === sha1 && (!legacyPath || legacyChecksum === sha1)) {
        return true;
      }
    } catch {
      await makeDir(filePath);
      if (legacyPath) await makeDir(path.dirname(legacyPath));
    }

    encodedUrl = getUri(url);

    const { data } = await axios.get(encodedUrl, {
      responseType: 'stream',
      responseEncoding: null,
      adapter,
      timeout: 60000 * 20
    });

    const wStream = fss.createWriteStream(fileName, {
      encoding: null
    });

    data.pipe(wStream);
    let wStreamLegacy;
    if (legacyPath) {
      wStreamLegacy = fss.createWriteStream(legacyPath, {
        encoding: null
      });
      data.pipe(wStreamLegacy);
    }

    await new Promise((resolve, reject) => {
      data.on('error', err => {
        console.error(err);
        reject(err);
      });

      data.on('end', () => {
        wStream.end();
        wStream.close();
        if (legacyPath) {
          wStreamLegacy.end();
          wStreamLegacy.close();
        }
        resolve();
      });
    });
    return true;
  } catch (e) {
    console.error(
      `Error while downloading <${url} | ${encodedUrl}> to <${fileName}> --> ${e.message}`
    );
    return false;
  }
};

export const downloadFile = async (mainWindow, fileName, url, onProgress) => {
  await makeDir(path.dirname(fileName));

  const encodedUrl = getUri(url);

  const { data, headers } = await axios.get(encodedUrl, {
    responseType: 'stream',
    responseEncoding: null,
    adapter,
    timeout: 60000 * 20
  });

  const out = fss.createWriteStream(fileName, { encoding: null });
  data.pipe(out);

  // Save variable to know progress
  let receivedBytes = 0;
  const totalBytes = parseInt(headers['content-length'], 10);

  data.on('data', chunk => {
    // Update the received bytes
    receivedBytes += chunk.length;
    if (onProgress) {
      mainWindow.webContents.send(
        'download-file-progress',
        parseInt(((receivedBytes * 100) / totalBytes).toFixed(1), 10)
      );
    }
  });

  return new Promise((resolve, reject) => {
    data.on('end', () => {
      out.end();
      out.close();
      resolve();
    });

    data.on('error', () => {
      reject();
    });
  });
};
