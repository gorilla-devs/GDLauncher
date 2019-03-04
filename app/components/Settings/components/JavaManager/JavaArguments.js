import React, { useState, useEffect } from 'react';
import { Icon, Slider, Tooltip, Input, Button, message } from 'antd';
import os from 'os';
import fs from 'fs';
import path from 'path';
import store from '../../../../localStore';
import { promisify } from 'util';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './JavaArguments.scss';
import Constants from '../../../../constants';
import { Arg } from '../../../../actions/settings';
import { DATAPATH, WINDOWS } from '../../../../constants';
import ButtonGroup from 'antd/lib/button/button-group';

function JavaArguments(props) {
  const [globalArg, setglobalArg] = useState();

  const dosName =
    os.release().substr(0, 2) === 10
      ? '"-Dos.name=Windows 10" -Dos.version=10.0 '
      : '';


  let defaultARGS = `-Dfml.ignorePatchDiscrepancies=true -Dfml.ignoreInvalidMinecraftCertificates=true ${dosName}${
    os.platform() === WINDOWS
      ? '-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump'
      : ''
    }-Xms256m -Xmx${props.ram}m`;

  async function readJArgFile() {

    if (store.has('settings.java.javaArg')) {
      console.log("DIOCAN");
      const JArgFileSec = store.get('settings.java.javaArg');
      setglobalArg(JArgFileSec);
      props.Arg(JArgFileSec);
    } else {
      console.log("DIOPEPPE");
      const JArgFile = store.set('settings.java.javaArg', defaultARGS);
      const JArgFileTh = store.get('settings.java.javaArg');
      setglobalArg(JArgFileTh);
      props.Arg(JArgFileTh);
    }


  }

  useEffect(() => {
    readJArgFile();
  }, []);

  async function submit() {
    props.Arg(globalArg);
    console.log("globalArg", globalArg);
    if (globalArg) {
      store.set('settings.java.javaArg', globalArg);
    } else message.error("enter valid arguments");
  }

  function reset() {
    const JArgFile = store.set('settings.java.javaArg', defaultARGS);
    const JArgFileTh = store.get('settings.java.javaArg');
    setglobalArg(JArgFileTh);
    props.Arg(JArgFileTh);
  }

  function inputFunc(e) {
    setglobalArg(e.target.value);
  }

  return (
    <div>
      <div className={styles.form}>
        <Input value={globalArg} onChange={(e) => inputFunc(e)} />
        <Button.Group>
        <Button type="primary" onClick={() => submit()}>Set</Button>
        <Button type="primary" onClick={() => reset()}>reset</Button>
        </Button.Group>

      </div>
      <hr />
    </div>
  );
}

function mapStateToProps(state) {
  return {
    //defaultJArg: state.javaArguments.defaultJarguments
    ram: state.settings.java.memory
  };
}

const mapDispatchToProps = {
  Arg
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(JavaArguments);
