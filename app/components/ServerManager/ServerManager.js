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
import ServerCommand from './serverCommand';

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
    try{

      const lines = (await promisify(fs.readFile)(path.join(SERVERS_PATH, serverName, "server.properties"))).toString('utf8');
      setCommand("serverSettings");
      setselectedServer(serverName);
      let values = {};
      lines.split("\n").forEach(arr => {
        const splitted = arr.split('=');
        if (arr.includes('=')) {
          values[splitted[0]] = splitted[1];
        }
      });
      setServerSettings(values);
      
    } catch(err){
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
    } catch(err) {
      const StringifedCommand = JSON.stringify(commands);
      const CommandFile = await promisify(fs.writeFile)(path.join(SERVERS_PATH, serverName, "serverCommands.json"), StringifedCommand);
      setCommands(commands);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.serverSettings}>

        <ServerCommand commandState={command} serverSettings={serverSettings} setServerSettings={setServerSettings} selectedServer={selectedServer} setselectedServer={setselectedServer} commands={commands} setCommands={setCommands}/>

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

              <Button icon="code" onClick={() => commandManager(name)}>
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