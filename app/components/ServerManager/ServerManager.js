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
import psTree from 'ps-tree';
import { startServer, deleteServer, kill } from '../../actions/serverManager';

function ServerManager(props) {
  const [servers, setServers] = useState([]);
  const [serverSettings, setServerSettings] = useState([]);

  useEffect(async () => {
    const dirs = await promisify(fs.readdir)(SERVERS_PATH);
    setServers(dirs);
    const watcher = fs.watch(SERVERS_PATH, async () => {
      const dirs = await promisify(fs.readdir)(SERVERS_PATH);
      setServers(dirs);
    });
    return () => watcher.close();
  }, []);


  function changeValue(){
    
  }

  async function manageServer(packName) {
    const lines = (await promisify(fs.readFile)(path.join(SERVERS_PATH, packName, "server.properties"))).toString('utf8');
    let param = lines.split("\n").map(v => v.split("="));
    console.log(param);
    setServerSettings(param.slice(2, param.length - 1));
  }

  return (
    <div className={styles.container}>

      <div className={styles.serverSettings}>
        {serverSettings.length > 0 ?
          serverSettings.map(p => (
            <div className={styles.rowSettings}>
              <div className={styles.FirstSetting} >
              {p[0]}
              </div>
              <Input className={styles.SecondSetting} onPressEnter={changeValue} value={p[1]}>
              </Input>
            </div>
          )) : null
        }
      </div>

      <div className={styles.Serverlist}>

        {servers.length > 0 &&
          servers.map(name => (
            <div key={name} className={styles.server}><h1>{name}</h1>
              {props.packName !== null && props.packName === name ?
                <Button type="primary" icon="thunderbolt" onClick={() => props.kill(name)}>
                  Kill
                </Button>
                :
                <Button type="primary" icon="play" onClick={() => props.startServer(name)}>
                  Start Server
                </Button>
              }
              <Button
                type="primary"
                disabled={props.packName !== null && props.packName === name}
                icon="cross"
                onClick={() => props.deleteServer(name)}
              >
                Delete Server
              </Button>

              <Button icon="radar-chart" onClick={() => manageServer(name)}>
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
    versionsManifest: state.packCreator.versionsManifest,
    packName: state.serverManager.packName
  };
}

const mapDispatchToProps = {
  startServer,
  deleteServer,
  kill
}

export default connect(mapStateToProps, mapDispatchToProps)(ServerManager);