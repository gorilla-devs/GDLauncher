import minimist from 'minimist';
import { exec } from 'child_process';
import log from 'electron-log';
import launchCommand from './MCLaunchCommand';
import store from '../localStore';

const parseCLI = async (data, callback) => {
  // toString is used if the instance name is a number (1132) or other values different from a string
  const instanceName = minimist(data.slice(1)).i.toString();
  const auth = store.get('user');
  const ram = store.get('settings').java.memory;
  const start = exec(
    await launchCommand(instanceName, auth, ram),
    (error, stdout, stderr) => {
      if (error) {
        log.error(`exec error: ${error}`);
        return;
      }
      log.info(`stdout: ${stdout}`);
      log.info(`stderr: ${stderr}`);
    }
  );
  start.on('exit', () => {
    callback();
  });
};

export default parseCLI;
