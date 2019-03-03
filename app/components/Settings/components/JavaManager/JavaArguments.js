import React, { useState, useEffect } from 'react';
import { Icon, Slider, Tooltip, Input, Button, message } from 'antd';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './JavaArguments.scss';
import Constants from '../../../../constants';
import { Arg } from '../../../../actions/javaArguments';
import { DATAPATH } from '../../../../constants';

function JavaArguments(props) {
  const [globalArg, setglobalArg] = useState();


  async function readJArgFile() {
    try {
      const JArgFileSec = await promisify(fs.readFile)(path.join(DATAPATH, "java-Arguments.config"));
      setglobalArg(JSON.parse(JArgFileSec));
      props.Arg(JSON.parse(JArgFileSec));
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    readJArgFile();
  }, []);

  async function submit() {
    props.Arg(globalArg);
    console.log("globalArg", globalArg);
    try {
      if (globalArg) {
        const StringifedArg = JSON.stringify(globalArg);
        const JArgFile = await promisify(fs.writeFile)(path.join(DATAPATH, "java-Arguments.config"), StringifedArg);
      } else message.error("enter valid arguments");
      setglobalArg(globalArg);
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
      </div>
      <hr />
    </div>
  );
}

function mapStateToProps(state) {
  return {
    //arguments: state.javaArguments.arguments
  };
}

const mapDispatchToProps = {
  Arg
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(JavaArguments);
