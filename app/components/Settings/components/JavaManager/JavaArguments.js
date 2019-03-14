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
  const [globalArgs, setglobalArgssInput] = useState(null);

  const updateJavaArguments = javaArguments => {
    setglobalArgssInput(javaArguments);
    props.setArg(javaArguments.replace('{_RAM_}', props.ram));
  }

  const dosName =
    os.release().substr(0, 2) === 10
      ? '"-Dos.name=Windows 10" -Dos.version=10.0 '
      : '';


  let defaultArgs = `-Dfml.ignorePatchDiscrepancies=true -Dfml.ignoreInvalidMinecraftCertificates=true ${dosName}${
    os.platform() === WINDOWS
      ? '-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump'
      : ''
    }-Xms256m -Xmx{_RAM_}m`;

  async function readStoreJavaArg() {
    if (store.has('settings.java.javaArg')) {
      const storeJavaArgumentsSec = store.get('settings.java.javaArg');
      updateJavaArguments(storeJavaArgumentsSec);
    } else {
      store.set('settings.java.javaArg', defaultArgs);
      updateJavaArguments(defaultArgs);
    }
  }

  useEffect(() => {
    readStoreJavaArg();
  }, []);

  async function submit() {
    props.setArg(globalArgs.replace('{_RAM_}', props.ram));
    if (globalArgs) {
      store.set('settings.java.javaArg', globalArgs);
    } else message.error("enter valid arguments");
  }

  //reset the global arguments
  function reset() {
    store.set('settings.java.javaArg', defaultArgs);
    updateJavaArguments(defaultArgs);
  }

  return (
    <div>
      <div style={{ display: 'inline' }}>
        <Input value={globalArgs} style={{
          maxWidth: '75%',
          marginRight: '10px'
        }} onChange={(e) => setglobalArgssInput(e.target.value)} />
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
