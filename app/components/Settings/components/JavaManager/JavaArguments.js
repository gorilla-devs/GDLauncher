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

function JavaArguments(props) {
  const [globalArg, setglobalArg] = useState();

  const dosName =
    os.release().substr(0, 2) === 10
      ? '"-Dos.name=Windows 10" -Dos.version=10.0 '
      : '';

  async function readJArgFile() {
    console.log("GGGGG", globalArg);

    let defaultARGS = `-Dfml.ignorePatchDiscrepancies=true -Dfml.ignoreInvalidMinecraftCertificates=true ${dosName}${
      os.platform() === WINDOWS
        ? '-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump'
        : ''
      }-Xms256m -Xmx${props.ram}m`;

    if (store.has('settings.settings.javaArg')) {
      const JArgFileSec = store.get('settings.java.javaArg');
      setglobalArg(JArgFileSec);
      props.Arg(JArgFileSec);
    } else {
      const JArgFile = store.set('settings.java.javaArg', defaultARGS);
      const JArgFileSec = store.get('settings.java.javaArg');
      setglobalArg(JArgFileSec);
      props.Arg(JArgFileSec);
    }


  }

  useEffect(() => {
    readJArgFile();
  }, []);

  async function submit() {
    props.Arg(globalArg);
    console.log("globalArg", globalArg);
    try {
      if (store.has('javaArg')) {
        // const StringifedArg = JSON.stringify(globalArg);
        // console.log(typeof(globalArg));
        // console.log(typeof(JSON.stringify(globalArg)));
        const JArgFile = await store.set('settings.java.javaArg', globalArg);
        //const JArgFile = await promisify(fs.writeFile)(path.join(DATAPATH, "java-Arguments.config"), globalArg);

      } else message.error("enter valid arguments");
    } catch (err) {
      console.error(err);
    }

  }

  function inputFunc(e) {
    setglobalArg(e.target.value);
  }

  return (
    <div>
      <div >
        <Input value={globalArg} onChange={(e) => inputFunc(e)} />
        <Button type="primary" onClick={() => submit()}>Set</Button>
        <Button type="primary">reset</Button>
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
