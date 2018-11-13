import minimist from 'minimist';
import { exec } from 'child_process';
import launchCommand from './MCLaunchCommand';
import store from '../localStore';

const parseCLI = async (data, callback) => {
  const instanceName = (minimist(data.slice(1)).i).toString();
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
