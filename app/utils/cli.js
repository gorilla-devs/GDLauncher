import minimist from 'minimist';
import { exec } from 'child_process';
import launchCommand from './MCLaunchCommand';
import store from '../localStore';

const parseCLI = async (data, callback) => {
  // toString is used if the instance name is a number (1132) or other values different from a string
  const instanceName = minimist(data.slice(1)).i.toString();
  const auth = store.get('user');
  const start = exec(
    await launchCommand(instanceName, auth),
    (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    }
  );
  start.on('exit', () => {
    callback();
  });
};

export default parseCLI;
