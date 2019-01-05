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
  const [serverSettings, setServerSettings] = useState({});
  const [selectedServer, setselectedServer] = useState(null);

  useEffect(async () => {
    const dirs = await promisify(fs.readdir)(SERVERS_PATH);
    setServers(dirs);
    const watcher = fs.watch(SERVERS_PATH, async () => {
      const dirs = await promisify(fs.readdir)(SERVERS_PATH);
      setServers(dirs);
    });
    return () => watcher.close();
  }, []);


  function changeValue(e, key) {
    setServerSettings({
      ...serverSettings,
      [key]: e.target.value
    });
  }

  async function manageServer(serverName) {
    const lines = (await promisify(fs.readFile)(path.join(SERVERS_PATH, serverName, "server.properties"))).toString('utf8');
    let values = {};
    lines.split("\n").forEach(arr => {
      const splitted = arr.split('=');
      values[splitted[0]] = splitted[1];
    });
    setselectedServer(serverName)
    setServerSettings(values);
  }

  const updateConfig = async () => {
    let write = '';
    Object.keys(serverSettings).forEach(k => {
      write = write.concat(`${k}=${serverSettings[k]}\n`);
    });
    console.log(write);
    await promisify(fs.writeFile)(path.join(SERVERS_PATH, selectedServer, "server.properties"), write, {flag: 'w+'});
  };

  return (
    <div className={styles.container}>

      <div className={styles.serverSettings}>
        {Object.keys(serverSettings).length > 0 ?
          Object.keys(serverSettings).map((p, i) => (
            <div key={i} className={styles.rowSettings}>
              <div className={styles.FirstSetting} >
                {p}
              </div>
              <Input className={styles.SecondSetting}
                value={serverSettings[p]}
              onChange={(e) => changeValue(e, p)}
              onPressEnter={updateConfig}
              >
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