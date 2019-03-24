// @flow
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { message, Input, Button } from 'antd';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import { Link } from 'react-router-dom';
import { promisify } from 'util';
import fs from 'fs';
import log from 'electron-log';
import { exec } from 'child_process';
import path from 'path';
import psTree from 'ps-tree';
import { ipcRenderer } from 'electron';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './ServerManager.scss';
import ServerCommand from './serverCommand';
import { downloadFile } from '../../utils/downloader';
import { SERVERS_PATH } from '../../constants';
import { startServer, deleteServer, kill, killAll } from '../../actions/serverManager';

function ServerManager(props) {
  const [servers, setServers] = useState([]);
  const [serverSettings, setServerSettings] = useState({});
  const [selectedServer, setselectedServer] = useState("");
  const [serverName, setserverName] = useState("");
  const [command, setCommand] = useState(null);
  const [commands, setCommands] = useState({
    "op": "",
    "kick": "",
    "ban": "",
    "ban-ip": "",
    "pardon": "",
    "pardon-ip": "",
    "kill": "",
    "gamemode": "",
    "toggledownfall": "",
    "tell": ""
  });
  async function WatcherReader() {
    const dirs = await promisify(fs.readdir)(SERVERS_PATH);
    setServers(dirs);
    const watcher = fs.watch(SERVERS_PATH, async () => {
      const dirs = await promisify(fs.readdir)(SERVERS_PATH);
      setServers(dirs);
    });
    return () => watcher.close();
  }

  useEffect(() => {
    WatcherReader();
  }, []);


  function changeValue(e, key) {
    setServerSettings({
      ...serverSettings,
      [key]: e.target.value
    });
  }

  function startServerFunc(name) {
    props.startServer(name);
  }

  async function manageServer(serverName) {
    try {

      setCommand("serverSettings");
      setselectedServer(serverName);
      const lines = (await promisify(fs.readFile)(path.join(SERVERS_PATH, serverName, "server.properties"))).toString('utf8');
      let values = {};
      lines.split("\n").forEach(arr => {
        const splitted = arr.split('=');
        if (arr.includes('=')) {
          values[splitted[0]] = splitted[1];
        }
      });
      setServerSettings(values);

    } catch (err) {
      message.error("You have to run a first time the server!")
    }
  }

  const updateConfig = async () => {
    let write = '';

    Object.keys(serverSettings).forEach(k => {
      write = write.concat(`${k}=${serverSettings[k]}\n`);
    });

    await promisify(fs.writeFile)(path.join(SERVERS_PATH, selectedServer, "server.properties"), write, { flag: 'w+' });
  };

  async function commandManager(serverName) {
    setCommand("command");
    setselectedServer(serverName);
    try {
      const CommandFile = await promisify(fs.readFile)(path.join(SERVERS_PATH, serverName, "serverCommands.json"));
      setCommands(JSON.parse(CommandFile));
    } catch (err) {
      const StringifedCommand = JSON.stringify(commands);
      const CommandFile = await promisify(fs.writeFile)(path.join(SERVERS_PATH, serverName, "serverCommands.json"), StringifedCommand);
      setCommands(commands);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.serverSettings}>

        <ServerCommand commandState={command} serverSettings={serverSettings} setServerSettings={setServerSettings} selectedServer={selectedServer} setselectedServer={setselectedServer} commands={commands} setCommands={setCommands} />

      </div>
      <div className={styles.Serverlist}>

        {servers.length > 0 &&
          servers.map(name => (
            <div key={name} className={styles.server}><h1>{name}</h1>
              {props.serversList[name] ?
                <Button className={styles.serverButton} type="primary" icon="thunderbolt" onClick={() => props.kill(name)}>
                  Kill
                </Button>
                :
                <Button className={styles.serverButton} type="primary" icon="play" onClick={() => startServerFunc(name)}>
                  <FontAwesomeIcon icon="play"></FontAwesomeIcon>
                </Button>
              }
              <Link
                to={{
                  pathname: `/confirmInstanceDelete/server/${name}`,
                  state: { modal: true }
                }}
              >
                <Button
                  type="primary"
                  disabled={props.packName !== null && props.packName === name}
                  className={styles.serverButton}
                  //onClick={() => props.deleteServer(name)}
                >
                  <FontAwesomeIcon icon="trash"></FontAwesomeIcon>
                </Button>
              </Link>

              <Button type="primary" className={styles.serverButton} onClick={() => manageServer(name)}>
                <FontAwesomeIcon icon="wrench"></FontAwesomeIcon>
              </Button>

              <Button className={styles.terminalButton} type="primary" onClick={() => commandManager(name)}>
                <FontAwesomeIcon icon="terminal"></FontAwesomeIcon>
              </Button>

            </div>))}

        <Link
          to={{
            pathname: '/ServerCreatorModal',
            state: { modal: true }
          }}
        >
          <Button icon="plus" type="primary" className={styles.AddButton} >
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
    serversList: state.serverManager.servers
  };
}

const mapDispatchToProps = {
  startServer,
  deleteServer,
  kill,
  killAll
}

export default connect(mapStateToProps, mapDispatchToProps)(ServerManager);