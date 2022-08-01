import makeDir from 'make-dir';
import fss from 'fs';
import axios from 'axios';
import pMap from 'p-map';
import path from 'path';
import adapter from 'axios/lib/adapters/http';
import computeFileHash from './computeFileHash';

const fs = fss.promises;

function getUri(url) {
  return new URL(url).href;
}

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
        if (legacyPath) {
          wStreamLegacy.end();
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

/**
 * @param {{ path: string, hashes: { sha1: string, sha512: string }, downloads: string[] }[]} files
 * @param {string} instancePath
 * @param {number} updatePercentage
 * @param {number} threads
 */
export const downloadInstanceFilesWithFallbacks = async (
  files,
  instancePath,
  updatePercentage,
  threads = 4
) => {
  let downloaded = 0;
  await pMap(
    files,
    async file => {
      let counter = 0;
      let res = false;
      do {
        counter += 1;
        if (counter !== 1) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }

        try {
          res = await downloadFileInstanceWithFallbacks(file, instancePath);
        } catch {
          // Do nothing
        }
      } while (!res && counter < 3);
      downloaded += 1;
      if (
        updatePercentage &&
        (downloaded % 5 === 0 || downloaded === files.length)
      ) {
        updatePercentage(downloaded);
      }
    },
    { concurrency: threads }
  );
};

/**
 * @param {{ path: string, hashes: { [algo: string]: string }, downloads: string[] }[]} file
 * @param {string} instancePath
 */
const downloadFileInstanceWithFallbacks = async (file, instancePath) => {
  const filePath = path.join(instancePath, file.path);
  const dirPath = path.dirname(filePath);
  try {
    await fs.access(filePath);

    let allChecksumsMatch = false;
    for (const algo of Object.keys(file.hashes)) {
      const checksum = await computeFileHash(filePath, algo);
      if (file.hashes[algo] === checksum) {
        allChecksumsMatch = true;
      }
    }
    if (allChecksumsMatch) {
      // the file already exists on disk, skip it
      return true;
    }
  } catch {
    await makeDir(dirPath);
  }

  // this loop exits as soon as a download has been successful
  for (const url of file.downloads) {
    const encodedUrl = getUri(url);
    try {
      const { data } = await axios.get(encodedUrl, {
        responseType: 'stream',
        responseEncoding: null,
        adapter,
        timeout: 60000 * 20
      });

      const wStream = fss.createWriteStream(filePath, {
        encoding: null
      });

      data.pipe(wStream);

      await new Promise((resolve, reject) => {
        data.on('error', err => {
          console.error(err);
          reject(err);
        });

        data.on('end', () => {
          wStream.end();
          resolve();
        });
      });

      return true;
    } catch (e) {
      console.error(
        `Error while downloading <${url} | ${encodedUrl}> to <${file.path}> --> ${e.message}`
      );
    }
  }
};

export const downloadFile = async (fileName, url, onProgress) => {
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
