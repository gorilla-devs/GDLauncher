// @flow
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { message, Input, Button } from 'antd';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import { Link } from 'react-router-dom';
import { promisify } from 'util';
import fs from 'fs';
import styles from './ServerManager.scss';
import { downloadFile } from '../../utils/downloader';
import { SERVERS_PATH } from '../../constants';
import { exec } from 'child_process';
import path from 'path';


async function StartServer(packName) {
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
  } catch (err) {
    console.error(err);
  }
}

function DeleteServer() {

}

function ServerManager(props) {
  const [servers, setServers] = useState([]);

  useEffect(async () => {
    const dirs = await promisify(fs.readdir)(SERVERS_PATH);
    setServers(dirs);
    const watcher = fs.watch(SERVERS_PATH, async () => {
      const dirs = await promisify(fs.readdir)(SERVERS_PATH);
      setServers(dirs);
    });
    return () => watcher.close();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.serverSettings}>
      </div>
      <div className={styles.Serverlist}>

        {servers.length > 0 &&
          servers.map(name => (
            <div key={name} className={styles.server}><h1>{name}</h1>
              <Button type="primary" icon="play" onClick={() => StartServer(name)}>
                Start Server
                </Button>
              <Button type="primary" icon="cross" onClick={DeleteServer} >
                Delete Server
                </Button>


            </div>))}


        <Link
          to={{
            pathname: '/ServerCreatorModal',
            state: { modal: true }
          }}
        >
          <Button icon="plus" className={styles.AddButton} >
            Add Server
        </Button>
        </Link>
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    versionsManifest: state.packCreator.versionsManifest
  };
}

function mapDispatchToProps() {
  return ({

  })
}

export default connect(mapStateToProps, mapDispatchToProps)(ServerManager);