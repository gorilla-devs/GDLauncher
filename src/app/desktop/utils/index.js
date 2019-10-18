import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { MC_LIBRARIES_URL } from "../../../common/utils/constants";

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

export const mavenToArray = (s, nativeString) => {
  const pathSplit = s.split(":");
  const fileName = pathSplit[3]
    ? `${pathSplit[2]}-${pathSplit[3]}`
    : pathSplit[2];
  const finalFileName = fileName.includes("@")
    ? fileName.replace("@", ".")
    : `${fileName}${nativeString || ""}.jar`;
  const initPath = pathSplit[0]
    .split(".")
    .concat(pathSplit[1])
    .concat(pathSplit[2].split("@")[0])
    .concat(`${pathSplit[1]}-${finalFileName}`);
  return initPath;
};

export const convertOSToMCFormat = ElectronFormat => {
  switch (ElectronFormat) {
    case "Windows_NT":
      return "windows";
    case "Darwin":
      return "osx";
    case "Linux":
      return "linux";
    default:
      return false;
  }
};

export const librariesMapper = (libraries, dataPath) => {
  function skipLibrary(lib) {
    let skip = false;
    if (lib.rules) {
      skip = true;
      lib.rules.forEach(({ action, os: ruleOs }) => {
        if (
          action === "allow" &&
          ((ruleOs && os.name === convertOSToMCFormat(os.type())) || !os)
        ) {
          skip = false;
        }
        if (
          action === "disallow" &&
          ((ruleOs && os.name === convertOSToMCFormat(os.type())) || !os)
        ) {
          skip = true;
        }
      });
    }
    return skip;
  }

  const nativeString = `natives-${convertOSToMCFormat(os.type())}`;

  return libraries
    .filter(v => !skipLibrary(v))
    .map(lib => {
      // Normal libs
      if (lib.downloads && lib.downloads.artifact) {
        return {
          url: lib.downloads.artifact.url,
          path: path.join(dataPath, "libraries", lib.downloads.artifact.path)
        };
      }
      // Vanilla native libs
      if (
        lib.downloads &&
        lib.downloads.classifiers &&
        lib.downloads.classifiers[nativeString]
      ) {
        return {
          url: lib.downloads.classifiers[nativeString].url,
          path: path.join(
            dataPath,
            "libraries",
            lib.downloads.classifiers[nativeString].path
          ),
          natives: true
        };
      }
      const isNative =
        lib.natives && lib.natives[convertOSToMCFormat(os.type())];

      return {
        url: `${lib.url || `${MC_LIBRARIES_URL}/`}${mavenToArray(
          lib.name,
          isNative && `-${nativeString}`
        ).join("/")}`,
        path: path.join(
          dataPath,
          "libraries",
          ...mavenToArray(lib.name, isNative && nativeString)
        ),
        ...(isNative && { natives: true })
      };
    });
};
