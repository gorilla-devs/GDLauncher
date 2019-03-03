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
import { DATAPATH, WINDOWS } from '../../../../constants';

function JavaArguments(props) {
  const [globalArg, setglobalArg] = useState();

  const dosName =
  os.release().substr(0, 2) === 10
    ? '"-Dos.name=Windows 10" -Dos.version=10.0 '
    : '';


  function DefARGFunc(){
    `-Dfml.ignorePatchDiscrepancies=true -Dfml.ignoreInvalidMinecraftCertificates=true ${dosName}
    ${
      os.platform() === WINDOWS
        ? '-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump'
        : ''
    }
     -Xms256m -Xmx{_RAM_}m`
  }

  async function readJArgFile() {
    try {
      //
      // const StringifedArg = JSON.stringify(props.defaultJArg);
      // const JArgFile = await promisify(fs.writeFile)(path.join(DATAPATH, "java-Arguments.config"), StringifedArg);
      //
      const JArgFileSec = await promisify(fs.readFile)(path.join(DATAPATH, "java-Arguments.config"));
      setglobalArg(JSON.parse(JArgFileSec));
      //props.Arg(JSON.parse(JArgFileSec));
    } catch (err) {
      let defaultARGS = ` -Dfml.ignorePatchDiscrepancies=true -Dfml.ignoreInvalidMinecraftCertificates=true ${dosName}
      ${
        os.platform() === WINDOWS
          ? '-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump'
          : ''
      }
       -Xms256m -Xmx{_RAM_}m`;
       
      const StringifedArg = JSON.stringify(defaultARGS);
      const JArgFileTH = await promisify(fs.writeFile)(path.join(DATAPATH, "java-Arguments.config"), StringifedArg);
      const JArgFileSec = await promisify(fs.readFile)(path.join(DATAPATH, "java-Arguments.config"));
      setglobalArg(JSON.parse(JArgFileSec));
    }
  }

  useEffect(() => {
    readJArgFile();
    
  }, []);

  async function submit() {
    props.Arg(globalArg.replace('{_RAM_}', props.ram));
    console.log("globalArg", globalArg);
    try {
      if (globalArg) {
        const StringifedArg = JSON.stringify(globalArg);
        const JArgFile = await promisify(fs.writeFile)(path.join(DATAPATH, "java-Arguments.config"), StringifedArg)
        
        
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
