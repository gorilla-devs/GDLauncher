import { message } from 'antd';
import log from 'electron-log';
import { exec } from 'child_process';
import path from 'path';
import { SERVERS_PATH } from '../constants';
import psTree from 'ps-tree';


export const START_INSTANCESERVER = 'START_INSTANCESERVER';

export const startServer = (packName) => {
  return (dispatch, getState) => {
    try {
      const start = exec(
        `java -Xms1G -Xmx1G -jar ${path.join(SERVERS_PATH, packName, `${packName}.jar nogui`)}`,
        { cwd: path.join(SERVERS_PATH, packName) },
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
        message.info('Server closed');
      });
      
      start.on('error', err => {
        message.error('There was an error while starting the server');
        log.error(err);
      });
      dispatch({
        type: START_INSTANCESERVER,
        payload: packName,
        pid: start.pid
      });
    } catch (err) {
      console.error(err);
    }
  }
};

export const DeleteServer = () => {

}

export const Kill = () => {
  return (dispatch, getState) => {
    const { serverManager } = getState();
    psTree(serverManager.pid, (err, children) => {
      children.forEach(el => {
        process.kill(el.PID);
      });
    });
  }
}
