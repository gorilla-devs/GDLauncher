import React, { useState, useEffect } from 'react';
import { Icon, Slider, Tooltip, Input, Button, message } from 'antd';
import os from 'os';
import fs from 'fs';
import path from 'path';
import store from '../../../../localStore';
import { promisify } from 'util';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { arg } from '../../../../actions/settings';
import { DATAPATH, WINDOWS } from '../../../../constants';

function javaArguments(props) {
  const [globalArg, setGlobalArg] = useState();

  const dosName =
    os.release().substr(0, 2) === 10
      ? '"-Dos.name=Windows 10" -Dos.version=10.0 '
      : '';


  let defaultARGS = `-Dfml.ignorePatchDiscrepancies=true -Dfml.ignoreInvalidMinecraftCertificates=true ${dosName}${
    os.platform() === WINDOWS
      ? '-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump'
      : ''
    }-Xms256m -Xmx${props.ram}m`;

  async function readStoreJavaArg() {

    if (store.has('settings.java.javaArg')) {
      const StorejavaArgumentsSec = store.get('settings.java.javaArg');
      setGlobalArg(StorejavaArgumentsSec);
      props.arg(StorejavaArgumentsSec);
    } else {
      const StorejavaArguments = store.set('settings.java.javaArg', defaultARGS);
      const readStorejavaArguments = store.get('settings.java.javaArg');
      setGlobalArg(readStorejavaArguments);
      props.arg(readStorejavaArguments);
    }


  }

  useEffect(() => {
    readStoreJavaArg();
  }, []);

  async function submit() {
    props.arg(globalArg);
    if (globalArg) {
      store.set('settings.java.javaArg', globalArg);
    } else message.error("enter valid arguments");
  }

  function reset() {
    const StorejavaArguments = store.set('settings.java.javaArg', defaultARGS);
    const readStorejavaArguments = store.get('settings.java.javaArg');
    setGlobalArg(readStorejavaArguments);
    props.arg(readStorejavaArguments);
  }

  return (
    <div>
      <div style={{ display: 'inline' }}>
        <Input value={globalArg} style={{
          maxWidth: '75%',
          marginRight: '15px'
        }} onChange={(e) => setGlobalArg(e.target.value)} />
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
    ram: state.settings.java.memory
  };
}

const mapDispatchToProps = {
  arg
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(javaArguments);
