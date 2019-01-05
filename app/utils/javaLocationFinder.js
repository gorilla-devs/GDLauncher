import os from 'os';
import {
  LINUX,
  WINDOWS,
  DARWIN
} from '../constants';
import store from '../localStore';

const findJavaHome = async () => {
  const javaSettings = store.get('settings.java');
  if (javaSettings.autodetected) {
    const util = require('util');
    const exec = util.promisify(require('child_process').exec);
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
      const {
        stdout
      } = await exec(command);
      // This returns the first path found
      return stdout.split('\n')[0];
    } catch(e) {
      return null;
    }
  }
  return javaSettings.path;
};

export default findJavaHome;
