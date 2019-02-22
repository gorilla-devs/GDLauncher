import os from 'os';
import { promisify } from 'util';
import { exec } from 'child_process';
import { message } from 'antd';
import log from 'electron-log';
import { LINUX, WINDOWS, DARWIN } from '../constants';
import store from '../localStore';

export const findJavaHome = async () => {
  const javaSettings = store.get('settings.java');
  if (javaSettings.autodetected) {
    let command = null;
    switch (os.platform()) {
      case LINUX:
      case DARWIN:
        command = 'which java';
        break;
      case WINDOWS:
        command = 'where java';
        break;
      default:
        break;
    }
    try {
      const { stdout } = await promisify(exec)(command);
      // This returns the first path found
      return stdout.split('\n')[0];
    } catch (e) {
      log.info(`Could not find java path: ${e.message}`);
      message.error('Could not find the java path. Unlucky...');
      return null;
    }
  }
  return javaSettings.path;
};

export const isGlobalJavaOptions = async () => {
  const javaPath = await findJavaHome();
  try {
    const { stdout, stderr } = await promisify(exec)(`"${javaPath}" -version`);
    const validOutput = stdout === "" ? stderr : stdout;
    return validOutput.includes('_JAVA_OPTIONS') && validOutput.includes('-Xmx');
  } catch (e) {
    log.info(`Could not check for global java options: ${e.message}`);
    return false;
  }
};
