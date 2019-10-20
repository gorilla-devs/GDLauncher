import makeDir from "make-dir";
import fss from "fs";
import reqCall from "request";
import pMap from "p-map";
import path from "path";
import request from "request-promise-native";
import { getFileHash } from ".";

const fs = fss.promises;

export const downloadArr = async (arr, updatePercentage, threads = 4) => {
  let downloaded = 0;
  await pMap(
    arr,
    async item => {
      let counter = 0;
      let res = false;
      do {
        res = await downloadFileInstance(item.path, item.url, item.sha1); // eslint-disable-line no-await-in-loop
        counter += 1;
      } while (!res && counter < 3);
      downloaded += 1;
      if (downloaded % 5 === 0 || downloaded === arr.length)
        updatePercentage(downloaded);
    },
    { concurrency: threads }
  );
};

const downloadFileInstance = async (fileName, url, sha1) => {
  try {
    const filePath = path.dirname(fileName);
    try {
      await fs.access(fileName);
      const checksum = await getFileHash(fileName);
      if (checksum === sha1) return true;
    } catch (e) {
      await makeDir(filePath);
    }
    const file = await request(url, { encoding: "binary" });
    await fs.writeFile(fileName, file, "binary");
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
  return new Promise((resolve, reject) => {
    // Save variable to know progress
    let receivedBytes = 0;
    let totalBytes = 0;

    const req = reqCall({
      method: "GET",
      uri: url
    });
    const out = fss.createWriteStream(fileName);
    req.pipe(out);

    req.on("response", data => {
      // Change the total bytes value to get progress later.
      totalBytes = parseInt(data.headers["content-length"], 10);
    });

    req.on("data", chunk => {
      // Update the received bytes
      receivedBytes += chunk.length;
      onProgress(((receivedBytes * 100) / totalBytes).toFixed(1));
    });

    req.on("end", () => {
      resolve();
    });

    req.on("error", () => {
      reject();
    });
  });
};
