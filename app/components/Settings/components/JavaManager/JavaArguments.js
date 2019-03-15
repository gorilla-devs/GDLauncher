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
import { setArgs } from '../../../../actions/settings';
import { DEFAULT_ARGS } from '../../../../constants';
import styles from './JavaManager.scss';

type Props ={
  setArgs: () => void
}

function JavaArguments(props) {
  const [globalArgs, setglobalArgsInput] = useState(null);

  const updateJavaArguments = javaArguments => {
    setglobalArgsInput(javaArguments);
    props.setArgs(javaArguments);
  }

  // Store is red if it exists and if it doesn't it's created, read and set to the redux store to be read by the instances launcher (utils/MCLaunchCommand)    
  async function readStoreJavaArgs() {
    const storeJavaArguments = store.get('settings.java.javaArg');
    updateJavaArguments(storeJavaArguments);
  }

  useEffect(() => {
    readStoreJavaArgs();
  }, []);

  //set the changed java arguments
  async function submit() {
    props.setArgs(globalArgs);
    if (globalArgs) {
      updateJavaArguments(globalArgs);
    } else message.error("Enter Valid Arguments");
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
        }} onChange={(e) => setglobalArgsInput(e.target.value)} />
        <Button.Group>
          <Button type="primary" onClick={() => submit()}><FontAwesomeIcon icon={faCheck} /></Button>
          <Button type="primary" onClick={() => reset()}><FontAwesomeIcon icon={faUndo} /></Button>
        </Button.Group>
      </div>
      <hr />
    </div>
  );
}

const mapDispatchToProps = {
  setArgs
}

export default connect(
  null,
  mapDispatchToProps
)(JavaArguments);
