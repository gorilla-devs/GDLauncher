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


function serverCommand(props) {
  const [serverSettings, setServerSettings] = useState({});
  const [serverCommandValue, setserverCommandValue] = useState();

  const updateConfig = async () => {
    let write = '';

    Object.keys(props.serverSettings).forEach(k => {
      write = write.concat(`${k}=${props.serverSettings[k]}\n`);
    });

    await promisify(fs.writeFile)(path.join(SERVERS_PATH, props.selectedServer, "server.properties"), write, { flag: 'w+' });
  };

  function runCommand(name) {
    props.start.stdin.end(`/op ${name}`);
  }

  async function manageServer(serverName) {
    const lines = (await promisify(fs.readFile)(path.join(SERVERS_PATH, props.selectedServer, "server.properties"))).toString('utf8');
    let values = {};
    lines.split("\n").forEach(arr => {
      const splitted = arr.split('=');
      if (arr.includes('=')) {
        values[splitted[0]] = splitted[1];
      }
    });
    props.setselectedServer(props.selectedServer)
    props.setServerSettings(values);
  }

  function ServerCommandsChangeValue(e) {
    setserverCommandValue(e.target.value);
  }

  function changeValue(e, key) {
    props.setServerSettings({
      ...props.serverSettings,
      [key]: e.target.value
    });
  }

  if (Object.keys(props.serverSettings).length > 0 && props.commandState.view == "serverSettings") {
    return (

      Object.keys(props.serverSettings).map((p, i) => (
        <div key={i} className={styles.rowSettings}>
          <div className={styles.FirstSetting} >
            {p}
          </div>
          <Input className={styles.SecondSetting}
            value={props.serverSettings[p]}
            onChange={(e) => changeValue(e, p)}
            onPressEnter={updateConfig}
          >
          </Input>
        </div>
      ))

    )
  }
  else if (props.commandState.view == "command") {
    return (

      <div className={styles.rowSettings}>
        <div className={styles.FirstSetting} >
          Op
        </div>
        <Input className={styles.SecondSetting}
          value={serverCommandValue}
          onChange={(e) => ServerCommandsChangeValue(e)}
          onPressEnter={() => runCommand(serverCommandValue)}
        />
        <Button className={styles.commandButton} type="primary" onClick={() => runCommand(serverCommandValue)}>COSE</Button>
      </div>
    )
  }
  else {
    return (
      <div />
    );
  }
}

function mapStateToProps(state) {
  return {
    versionsManifest: state.packCreator.versionsManifest,
    packName: state.serverManager.packName,
    start: state.serverManager.process
  };
}

const mapDispatchToProps = {
  startServer,
  deleteServer,
  kill
}

export default connect(mapStateToProps, mapDispatchToProps)(serverCommand);