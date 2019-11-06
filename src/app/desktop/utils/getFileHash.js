import crypto from "crypto";
import fs from "fs";

const getFileHash = (filename, algorithm = "sha1") => {
  return new Promise((resolve, reject) => {
    const shasum = crypto.createHash(algorithm);
    try {
      const s = fs.ReadStream(filename);
      s.on("data", data => {
        shasum.update(data);
      });
      // making digest
      s.on("end", () => {
        const hash = shasum.digest("hex");
        return resolve(hash);
      });
    } catch (error) {
      return reject(new Error("calc fail"));
    }
  });
};

export default getFileHash;
