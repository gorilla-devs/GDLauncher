import { promises as fs } from "fs";
import path from "path";

export const isDirectory = source =>
  fs.lstat(source).then(r => r.isDirectory());

export const getDirectories = async source => {
  const dirs = await fs.readdir(source);
  return Promise.all(
    dirs
      .map(name => path.join(source, name))
      .filter(isDirectory)
      .map(dir => path.basename(dir))
  );
};

export const readConfig = async instancePath => {
  const configPath = path.join(instancePath, "config.json");
  const file = await fs.readFile(configPath);
  return JSON.parse(file);
};
