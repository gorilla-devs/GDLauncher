import murmur from "murmurhash-js";
import { promises as fs, createWriteStream, createReadStream } from "fs";
import fse from "fs-extra";
import path from "path";

export const sortByDate = (a, b) => {
  const dateA = new Date(a.fileDate);
  const dateB = new Date(b.fileDate);
  return dateB - dateA;
};

export const getForgeFileIDFromAddonVersion = async (files, addonVersion) => {
  const foundID = files.find(a => a.fileName.includes(addonVersion));
  return foundID ? foundID.id : null;
};

// Converts an array of bytes into a string
const bin2string = array => {
  let result = "";
  for (let i = 0; i < array.length; i += 1) {
    if (!isWhitespaceCharacter(array[i]))
      result += String.fromCharCode(array[i]);
  }
  return result;
};

// Returns if a specific byte is a whitespace
const isWhitespaceCharacter = b => {
  return b === 9 || b === 10 || b === 13 || b === 32;
};

// Create the murmur hash of a mod
export const getFileMurmurHash2 = async (filePath, tempPath) => {
  const stat = await fs.lstat(filePath);
  // 15mb
  if (stat.size < 15728640) {
    const file = await fs.readFile(filePath);
    return murmur.murmur2(bin2string(file), 1);
  }
  return new Promise((resolve, reject) => {
    const tempFileName = path.join(
      tempPath,
      `${Math.random()
        .toString(36)
        .substring(2, 15) +
        Math.random()
          .toString(36)
          .substring(2, 15)}.temp`
    );
    const ws = createWriteStream(tempFileName);
    createReadStream(filePath)
      .on("data", data => {
        let res = "";
        for (let i = 0; i < data.length; i += 1) {
          if (!isWhitespaceCharacter(data[i]))
            res += String.fromCharCode(data[i]);
        }
        ws.write(res);
      })
      .on("end", async () => {
        ws.end();
        const file = await fs.readFile(tempFileName);
        // No need to wait for this to be removed
        fse.remove(tempFileName);
        resolve(murmur.murmur2(file.toString(), 1));
      })
      .on("error", err => reject(err));
  });
};

export const numberToRoundedWord = number => {
  // Alter numbers larger than 1k
  if (number >= 1e3) {
    const units = ["k", "M", "B", "T"];

    // Divide to get SI Unit engineering style numbers (1e3,1e6,1e9, etc)
    const unit = Math.floor((number.toFixed(0).length - 1) / 3) * 3;
    // Calculate the remainder
    const num = (number / `1e${unit}`).toFixed(0);
    const unitname = units[Math.floor(unit / 3) - 1];

    // output number remainder + unitname
    return num + unitname;
  }

  // return formatted original number
  return number.toLocaleString();
};

export const removeDuplicates = (myArr, prop) => {
  return myArr.filter((obj, pos, arr) => {
    return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
  });
};
