import fss, { promises as fs } from "fs";
import fse from "fs-extra";
import crypto from "crypto";
import { extractFull } from "node-7z";
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

export const librariesMapper = (libraries, librariesPath) => {
  function skipLibrary(lib) {
    let skip = false;
    if (lib.rules) {
      skip = true;
      lib.rules.forEach(({ action, os: ruleOs }) => {
        if (
          action === "allow" &&
          ((ruleOs && ruleOs.name === convertOSToMCFormat(os.type())) ||
            !ruleOs)
        ) {
          skip = false;
        }
        if (
          action === "disallow" &&
          ((ruleOs && ruleOs.name === convertOSToMCFormat(os.type())) ||
            !ruleOs)
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
          path: path.join(librariesPath, lib.downloads.artifact.path),
          sha1: lib.downloads.artifact.sha1
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
            librariesPath,
            lib.downloads.classifiers[nativeString].path
          ),
          sha1: lib.downloads.classifiers[nativeString].sha1,
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
          librariesPath,
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
  } catch (err) {
    console.log(err);
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

export const fixFilePermissions = async filePath => {
  if (process.platform === "linux" || process.platform === "darwin") {
    await promisify(exec)(`chmod +x "${filePath}"`);
    await promisify(exec)(`chmod 755 "${filePath}"`);
  }
};

export const extract7z = async () => {
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
  await fixFilePermissions(get7zPath());
};

export const getFileHash = (filename, algorithm = "sha1") => {
  return new Promise((resolve, reject) => {
    const shasum = crypto.createHash(algorithm);
    try {
      const s = fss.ReadStream(filename);
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

export const extractNatives = async (libraries, instancePath) => {
  const extractLocation = path.join(instancePath, "natives");
  await Promise.all(
    libraries
      .filter(l => l.natives)
      .map(async l => {
        console.log(l);
        const extraction = extractFull(l.path, extractLocation, {
          $bin: get7zPath()
        });
        await new Promise((resolve, reject) => {
          extraction.on("end", () => {
            resolve();
          });
          extraction.on("error", err => {
            reject(err);
          });
        });
      })
  );
};

export const getJVMArguments112 = async (
  libraries,
  mcjar,
  instancePath,
  assetsPath,
  mcJson,
  account,
  jvmOptions = []
) => {
  const args = [];
  args.push("-cp");

  args.push(
    [mcjar, ...libraries]
      .filter(l => !l.natives)
      .map(l => `"${l.path}"`)
      .join(process.platform === "win32" ? ";" : ":")
  );

  // if (process.platform === "darwin") {
  //   args.push("-Xdock:name=instancename");
  //   args.push("-Xdock:icon=instanceicon");
  // }

  args.push("-Xmx1024m");
  args.push("-Xms128m");
  args.push(...jvmOptions);
  args.push(`-Djava.library.path="${path.join(instancePath, "natives")}"`);

  args.push(mcJson.mainClass);

  const mcArgs = mcJson.minecraftArguments.split(" ");
  const argDiscovery = /\${*(.*)}/;

  for (let i = 0; i < mcArgs.length; i += 1) {
    if (argDiscovery.test(mcArgs[i])) {
      const identifier = mcArgs[i].match(argDiscovery)[1];
      let val = null;
      switch (identifier) {
        case "auth_player_name":
          val = account.selectedProfile.name.trim();
          break;
        case "version_name":
          val = mcJson.id;
          break;
        case "game_directory":
          val = `"${instancePath}"`;
          break;
        case "assets_root":
          val = `"${assetsPath}"`;
          break;
        case "game_assets":
          val = `"${path.join(assetsPath, "virtual", "pre-1.6")}"`;
          break;
        case "assets_index_name":
          val = mcJson.assets;
          break;
        case "auth_uuid":
          val = account.selectedProfile.id.trim();
          break;
        case "auth_access_token":
          val = account.accessToken;
          break;
        case "auth_session":
          val = account.accessToken;
          break;
        case "user_type":
          val = "mojang";
          break;
        case "version_type":
          val = mcJson.type;
          break;
        default:
          break;
      }
      if (val != null) {
        mcArgs[i] = val;
      }
    }
  }

  args.push(...mcArgs);

  return args;
};
