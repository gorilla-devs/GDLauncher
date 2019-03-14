import React, { useState, useEffect } from 'react';
import { Icon, Slider, Tooltip, Input, Button, message } from 'antd';
import os from 'os';
import fs from 'fs';
import path from 'path';
import store from '../../../../localStore';
import { promisify } from 'util';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { setArg } from '../../../../actions/settings';
import { DATAPATH, WINDOWS } from '../../../../constants';

function JavaArguments(props) {
  const [globalArg, setGlobalArg] = useState(null);

  const dosName =
    os.release().substr(0, 2) === 10
      ? '"-Dos.name=Windows 10" -Dos.version=10.0 '
      : '';


  let defaultArgs = `-Dfml.ignorePatchDiscrepancies=true -Dfml.ignoreInvalidMinecraftCertificates=true ${dosName}${
    os.platform() === WINDOWS
      ? '-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump'
      : ''
    }-Xms256m -Xmx${props.ram}m`;

  async function readStoreJavaArg() {

    if (store.has('settings.java.javaArg')) {
      const storeJavaArgumentsSec = store.get('settings.java.javaArg');
      setGlobalArg(storeJavaArgumentsSec);
      props.setArg(storeJavaArgumentsSec);
    } else {
      const storeJavaArguments = store.set('settings.java.javaArg', defaultArgs);
      const readStoreJavaArguments = store.get('settings.java.javaArg');
      setGlobalArg(readStoreJavaArguments);
      props.setArg(readStoreJavaArguments);
    }


  }

  useEffect(() => {
    readStoreJavaArg();
  }, []);

  async function submit() {
    props.setArg(globalArg);
    if (globalArg) {
      store.set('settings.java.javaArg', globalArg);
    } else message.error("enter valid arguments");
  }

  function reset() {
    const storeJavaArguments = store.set('settings.java.javaArg', defaultArgs);
    const readStoreJavaArguments = store.get('settings.java.javaArg');
    setGlobalArg(readStoreJavaArguments);
    props.setArg(readStoreJavaArguments);
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
          <Button type="primary" onClick={() => reset()}>Reset</Button>
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
  setArg
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(JavaArguments);
