import makeDir from 'make-dir';
import fss from 'fs';
import axios from 'axios';
import pMap from 'p-map';
import path from 'path';
import adapter from 'axios/lib/adapters/http';
import computeFileHash from './computeFileHash';

const fs = fss.promises;

export const downloadInstanceFiles = async (
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
        updatePercentage(downloaded);
      }
    },
    { concurrency: threads }
  );
};

const downloadFileInstance = async (fileName, url, sha1, legacyPath) => {
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

    const { data } = await axios.get(url, {
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
        if (legacyPath) {
          wStreamLegacy.end();
        }
        resolve();
      });
    });
    return true;
  } catch (e) {
    console.error(
      `Error while downloading <${url}> to <${fileName}> --> ${e.message}`
    );
    return false;
  }
};

export const downloadFile = async (fileName, url, onProgress) => {
  await makeDir(path.dirname(fileName));

  const { data, headers } = await axios.get(url, {
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
      onProgress(parseInt(((receivedBytes * 100) / totalBytes).toFixed(1), 10));
    }
  });

  return new Promise((resolve, reject) => {
    data.on('end', () => {
      out.end();
      resolve();
    });

    data.on('error', () => {
      reject();
    });
  });
};
