import { promises as fs } from "fs";
import fse from "fs-extra";
import os from "os";
import { promisify } from "util";
import { remote } from "electron";
import path from "path";
import { exec } from "child_process";
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

export const isLatestJavaDownloaded = async meta => {
  const mcOs = convertOSToMCFormat(os.type());
  const javaFolder = path.join(
    remote.app.getPath("userData"),
    "java",
    meta[mcOs][64].jre.version
  );
  // Check if it's downloaded, if it's latest version and if it's a valid download
  let isValid = true;
  try {
    await fs.access(javaFolder);
    const { stdout, stderr } = await promisify(exec)(
      `"${path.join(
        javaFolder,
        "bin",
        `java${mcOs === "windows" ? ".exe" : ""}`
      )}" -version`
    );
    if (
      !stderr.includes(meta[mcOs][64].jre.version) &&
      !stdout.includes(meta[mcOs][64].jre.version)
    ) {
      throw new Error("Java corrupted");
    }
  } catch {
    isValid = false;
  }
  return isValid;
};

export const get7zPath = () => {
  const baseDir = remote.app.getPath("userData");
  if (process.platform === "darwin") {
    return path.join(baseDir, "7za-osx");
  }
  if (process.platform === "win32") {
    return path.join(baseDir, "7za.exe");
  }
  return path.join(baseDir, "7za-linux");
};

export const extract7zAndFixPermissions = async () => {
  const baseDir = path.join(
    remote.app.getAppPath(),
    process.env.NODE_ENV === "development" ? "public" : "build",
    "7z"
  );
  let zipLocationAsar = path.join(baseDir, "7za-linux");
  if (process.platform === "darwin") {
    zipLocationAsar = path.join(baseDir, "7za-osx");
  }
  if (process.platform === "win32") {
    zipLocationAsar = path.join(baseDir, "7za.exe");
  }

  await fse.copy(zipLocationAsar, get7zPath());

  if (process.platform === "linux" || process.platform === "darwin") {
    // const { stdout, stderr } = await promisify(exec)(
    //   `chmod +x "${get7zPath()}"`
    // );
  }
};
