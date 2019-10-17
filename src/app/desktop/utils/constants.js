import path from "path";
import { platform, homedir } from "os";

export const WINDOWS = "win32";
export const LINUX = "linux";
export const DARWIN = "darwin";
export const DESKTOP_PATH = path.join(homedir(), "Desktop");
export const CLASSPATH_DIVIDER_CHAR = platform() === WINDOWS ? ";" : ":";
