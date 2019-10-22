import path from "path";
import { platform, homedir } from "os";

export const WINDOWS = "win32";
export const LINUX = "linux";
export const DARWIN = "darwin";
export const DESKTOP_PATH = path.join(homedir(), "Desktop");
export const CLASSPATH_DIVIDER_CHAR = platform() === WINDOWS ? ";" : ":";
export const DEFAULT_JAVA_ARGS = `-Dfml.ignorePatchDiscrepancies=true -Dfml.ignoreInvalidMinecraftCertificates=true ${
  platform() === WINDOWS
    ? "-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump"
    : ""
} -Xms256m`;
export const DEFAULT_MEMORY = 4096;
