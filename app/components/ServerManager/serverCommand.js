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
import stringio from '@rauschma/stringio';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { startServer, deleteServer, kill } from '../../actions/serverManager';
import styles from './ServerManager.scss';
import { downloadFile } from '../../utils/downloader';
import { SERVERS_PATH } from '../../constants';
import ButtonGroup from 'antd/lib/button/button-group';
import Command from './command';

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

  async function writeToWritable(writable, data) {
    console.log("DATA", data);

    await writable.write(data);
  }

  async function runCommand(command, param) {
    console.log(command, param);
    try {
      let paramL = `/${command} ${param}\n`;
      await writeToWritable(props.start.stdin, paramL);

    } catch{

    }
  }

  async function runCustomCommand(command) {
    console.log(command);
    try {
      let paramL = `/${command}\n`;
      await writeToWritable(props.start.stdin, paramL);

    } catch{

    }
  }

  function ServerCommandsChangeValueTWO(e, command) {
    props.setCommands({
      ...props.commands,
      [command]: e.target.value
    })
  }
  async function GetIp() {
    let { ip } = (await axios.get(`https://api.ipify.org/?format=json`)).data;
    setIp(ip);
  }

  useEffect(() => {
    GetIp();
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
        {
          <div>
            <Command command="op" switch="false"/>
            <Command command="kick" switch="false"/>
            <Command command="ban" switch="false"/>
            <Command command="ip-ban" switch="false"/>
            <Command command="pardon" switch="false"/>
            <Command command="pardon-ip" switch="false"/>
            <Command command="kill" switch="false"/>
            <Command command="gamemode" switch="true" />

          </div>
        }

        {/*
        //CANCELLARE
        <div className={styles.rowSettings}>
          <div className={styles.FirstSetting} >
            Run/Add a Command
             </div>
          <Input className={styles.SecondSetting}
            //placeholder="/"
            value={serverCommandValue}
            onChange={(e) => ServerCommandsChangeValue(e)}
          />
          <Button.Group className={styles.ButtonGroup}>
            <Button type="primary" onClick={() => runCustomCommand(serverCommandValue)}>
              <FontAwesomeIcon icon="play"></FontAwesomeIcon>
            </Button>
            <Button type="primary" onClick={() => createCommand(serverCommandValue)}>
              <FontAwesomeIcon icon="plus"></FontAwesomeIcon>
            </Button>
          </Button.Group>

        </div> */}


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
    packName: state.serverManager.packName, //testare
    start: state.serverManager.process
  };
}

const mapDispatchToProps = {
  startServer,
  deleteServer,
  kill
}

export default connect(mapStateToProps, mapDispatchToProps)(serverCommand);