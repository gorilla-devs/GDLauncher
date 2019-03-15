import React, { useState, useEffect } from 'react';
import { Icon, Slider, Tooltip, Input, Button, message } from 'antd';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo } from '@fortawesome/free-solid-svg-icons';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { promisify } from 'util';
import { connect } from 'react-redux';
import store from '../../../../localStore';
import { setArgs, saveSettings } from '../../../../actions/settings';
import { DEFAULT_ARGS } from '../../../../constants';
import styles from './JavaManager.scss';

function JavaArguments(props) {
  const [globalArgs, setglobalArgssInput] = useState(null);

  const updateJavaArguments = javaArguments => {
    setglobalArgssInput(javaArguments);
    props.setArgs(javaArguments);
  }

  // store is red if it exist and if it doesn't it's create, read and setted to the redux store to be read by the instances launcher (utils/MCLaunchCommand)  
  async function readStoreJavaArg() {
    const storeJavaArgumentsSec = store.get('settings.java.javaArg');
    updateJavaArguments(storeJavaArgumentsSec);
  }

  useEffect(() => {
    readStoreJavaArg();
  }, []);

  //set the changed java arguments
  async function submit() {
    props.setArgs(globalArgs);
    if (globalArgs) {
      updateJavaArguments(globalArgs);
    } else message.error("enter valid arguments");
  }

  //reset the global arguments to the defalut one
  function reset() {
    updateJavaArguments(DEFAULT_ARGS);
  }

  return (
    <div>
      <div style={{ display: 'inline' }}>
        <Input value={globalArgs} style={{
          maxWidth: '80%',
          marginRight: '10px'
        }} onChange={(e) => setglobalArgssInput(e.target.value)} />
        <Button.Group>
          <Button type="primary" onClick={() => submit()}><FontAwesomeIcon icon={faCheck} /></Button>
          <Button type="primary" onClick={() => reset()}><FontAwesomeIcon icon={faUndo} /></Button>
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
  setArgs,
  saveSettings
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(JavaArguments);
