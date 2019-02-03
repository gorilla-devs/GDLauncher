// @flow
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { message, Input, Button, Tooltip } from 'antd';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import { Link } from 'react-router-dom';
import { promisify } from 'util';
import fs from 'fs';
import { exec } from 'child_process';
import path from 'path';
import psTree from 'ps-tree';
import _ from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { startServer, deleteServer, kill } from '../../actions/serverManager';
import styles from './ServerManager.scss';
import { downloadFile } from '../../utils/downloader';
import { SERVERS_PATH } from '../../constants';
import ButtonGroup from 'antd/lib/button/button-group';
import { async } from 'q';


function serverCommand(props) {
  const [serverSettings, setServerSettings] = useState({});
  const [serverCommandValue, setserverCommandValue] = useState();
  const [Ip, setIp] = useState();

  const updateConfig = async () => {
    let write = '';

    Object.keys(props.serverSettings).forEach(k => {
      write = write.concat(`${k}=${props.serverSettings[k]}\n`);
    });

    await promisify(fs.writeFile)(path.join(SERVERS_PATH, props.selectedServer, "server.properties"), write, { flag: 'w+' });
  };

 async function runCommand(command, param) {
    console.log(command, param);
    await props.start.stdin.end(`/${command} ${param}`);
  }

  function ServerCommandsChangeValueTWO(e, command) {
    props.setCommands({
      ...props.commands,
      [command]: e.target.value
    })
  }

  useEffect(async () => {
    let { ip } = (await axios.get(`https://api.ipify.org/?format=json`)).data;
    setIp(ip);
    //setCommands(props.commandFile);
  }, []);

  // async function manageServer(serverName) {
  //   const lines = (await promisify(fs.readFile)(path.join(SERVERS_PATH, props.selectedServer, "server.properties"))).toString('utf8');
  //   let values = {};
  //   lines.split("\n").forEach(arr => {
  //     const splitted = arr.split('=');
  //     if (arr.includes('=')) {
  //       values[splitted[0]] = splitted[1];
  //     }
  //   });
  //   props.setselectedServer(props.selectedServer)
  //   props.setServerSettings(values);
  // }

  async function createCommand(command) {
    if (command != "" && command != undefined) {
      props.setCommands({
        ...props.commands,
        [command]: ""
      });
      let JsonCommands = JSON.stringify(props.commands);
      await promisify(fs.writeFile)(path.join(SERVERS_PATH, props.selectedServer, "serverCommands.json"), JSON.stringify({
        ...props.commands,
        [command]: ""
      }), { flag: 'w+' });
      setserverCommandValue("");
    } else message.error('Enter a valid command');
  }

  function ServerCommandsChangeValue(e) {
    setserverCommandValue(e.target.value);
  }

  function removeCommand(command) {
    props.setCommands(_.omit(props.commands, command));
  }

  function changeValue(e, key) {
    props.setServerSettings({
      ...props.serverSettings,
      [key]: e.target.value
    });
  }

  if (Object.keys(props.serverSettings).length > 0 && props.commandState == "serverSettings") {
    return (
      <div>
        <div className={styles.rowTitle}>
          <div className={styles.FirstSetting} >
            {props.selectedServer}
          </div>
        </div>
        {Object.keys(props.serverSettings).map((p, i) => (
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
        ))}
      </div>
    )
  }
  else if (props.commandState == "command") {
    return (
      <div>
        <div className={styles.rowTitle}>
          {props.selectedServer}
        </div>
        <div className={styles.rowSettings}>
          {`Your ip :  ${Ip}`}
        </div>
        {Object.keys(props.commands).length > 0 ?
          Object.keys(props.commands).map(command => (
            <div className={styles.rowSettings}>
              <div className={styles.FirstSetting} >
                {command}
              </div>
              <Input className={styles.SecondSetting}
                value={props.commands[command]}
                onChange={(e) => ServerCommandsChangeValueTWO(e, command)}
              />
              <Button.Group className={styles.ButtonGroup}>
                <Button type="primary" onClick={() => runCommand(command, props.commands[command])}>run</Button>
                <Button type="primary" onClick={() => removeCommand(command)}>remove</Button>
              </Button.Group>
            </div>
          ))
          : <div></div>
        }

        <div className={styles.rowSettings}>
          <div className={styles.FirstSetting} >
            Add a Command:
             </div>
          <Input className={styles.SecondSetting}
            value={serverCommandValue}
            onChange={(e) => ServerCommandsChangeValue(e)}
          />
          <Button className={styles.commandButton} type="primary" onClick={() => createCommand(serverCommandValue)}>
            <FontAwesomeIcon icon="plus"></FontAwesomeIcon>
          </Button>
        </div>
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