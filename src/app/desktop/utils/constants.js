import path from 'path';
import { platform, homedir } from 'os';

export const WINDOWS = 'win32';
export const LINUX = 'linux';
export const DARWIN = 'darwin';
export const DESKTOP_PATH = path.join(homedir(), 'Desktop');
export const CLASSPATH_DIVIDER_CHAR = platform() === WINDOWS ? ';' : ':';
export const DEFAULT_JAVA_ARGS = `${
  platform() === WINDOWS
    ? '-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump'
    : ''
} -Xms256m`;
export const REQUIRED_JAVA_ARGS =
  '-Dfml.ignorePatchDiscrepancies=true -Dfml.ignoreInvalidMinecraftCertificates=true';
export const DEFAULT_MEMORY = 4096;

export const resolutionPresets = [
  '854x480',
  '800x600',
  '1024x768',
  '1280x1024',
  '1366x768',
  '1600x900',
  '1920x1080',
  '2560x1440',
  '3440x1440',
  '3440x1500'
];
