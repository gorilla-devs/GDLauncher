import { message } from 'antd';
import log from 'electron-log';
import { exec, spawn } from 'child_process';
import path from 'path';
import { SERVERS_PATH } from '../constants';
import psTree from 'ps-tree';
import fse from 'fs-extra';

export const START_SERVER = 'START_SERVER';
export const STOP_SERVER = 'STOP_SERVER';

export const startServer = (packName) => {
  return (dispatch, getState) => {
    try {
      const start = spawn("java", [`-Xms1G -Xmx1G -jar ${path.join(SERVERS_PATH, packName, `${packName}.jar`)}`]);
      start.stdin.write("/op infernium2000");
      // const start = exec(
      //   `java -Xms1G -Xmx1G -jar ${path.join(SERVERS_PATH, packName, `${packName}.jar`)}`,
      //   { cwd: path.join(SERVERS_PATH, packName) },
      //   (error, stdout, stderr) => {
      //     if (error) {
      //       console.error(`exec error: ${error}`);
      //       return;
      //     }
      //     console.log(`stdout: ${stdout}`);
      //     console.log(`stderr: ${stderr}`);
      //   }
      // );

      // start.on('exit', () => {
      //   message.info('Server closed');
      // });

      // start.on('error', err => {
      //   message.error('There was an error while starting the server');
      //   log.error(err);
      // });
      dispatch({
        type: START_SERVER,
        packName,
        pid: start.pid,
        process: start
      });
    } catch (err) {
      console.error(err);
    }
  }
};

export const deleteServer = (packname) => {
  return async dispatch => {
    try {
      await fse.remove(path.join(SERVERS_PATH, packname));
    } catch (err) {
      console.error(err);
    }
  }
}

export const kill = () => {
  return (dispatch, getState) => {
    const { serverManager } = getState();
    dispatch({
      type: STOP_SERVER
    });
    psTree(serverManager.pid, (err, children) => {
      children.forEach(el => {
        process.kill(el.PID);
      });
    });
  }
}
