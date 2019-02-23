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
      const start = spawn(`java -Xms512M -Xmx1024M -jar ${path.join(SERVERS_PATH, packName, `${packName}.jar nogui`)}`,
        [], { shell: true, cwd: path.join(SERVERS_PATH, packName) });
      start.stdout.on("data", (data) => {
        console.log(data.toString());
      });
      start.stderr.on("data", (data) => {
        console.log(data.toString());
      });

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

function serverNameCheck(serverName, name) {
  if (serverName == name) {
    return name
  } else return "";
}

export const deleteServer = (packname) => {
  return async dispatch => {
    try {
      await fse.remove(path.join(SERVERS_PATH, packname));
    } catch (err) {
      console.error(err);
    }
  }
}

export const kill = (packName) => {
  return (dispatch, getState) => {
    const { serverManager } = getState();
    psTree(serverManager.servers[packName].pid, (err, children) => {
      children.forEach(el => {
        process.kill(el.PID);
      });
    });
    dispatch({
      type: STOP_SERVER,
      packName,
      pid: null,
    });
  }
}
export const killAll = () => {
  return (dispatch, getState) => {
    const { serverManager } = getState();
    log.info(serverManager.servers[el].pid);
    Object.keys(serverManager.servers).forEach(el =>
      psTree(serverManager.servers[el].pid, (err, children) => {
        children.forEach(e => {
          process.kill(e.PID);
        });
      })
    );
    dispatch({
      type: STOP_SERVER,
      packName,
      pid: null,
    });
  }
}
