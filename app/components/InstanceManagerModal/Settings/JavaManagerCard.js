import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Form, Input, Button, message, Switch, Tooltip } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import path from 'path';
import { promisify } from 'util';
import fs, { stat } from 'fs';
import { exec } from 'child_process';
import log from 'electron-log';
import _ from 'lodash';
import Card from '../../Common/Card/Card';
import styles from './JavaManagerCard.scss';
import { PACKS_PATH, DEFAULT_ARGS } from '../../../constants';
import { setJavaArgs } from '../../../actions/settings';
import { findJavaHome, checkJavaArch } from '../../../utils/javaHelpers';
import MemorySlider from './MemorySlider';
import JavaArgInput from './JavaArgInput';

function JavaManagerCard(props) {
  const [is64bit, setIs64bit] = useState(true);
  const [overrideArgs, setOverrideArgsInput] = useState(null);
  const [javaArgsSwitchState, setJavaArgsSwitchState] = useState(false);
  const [javaMemorySwitchState, setJavaMemorySwitchState] = useState(false);
  const [overrideJavaMemory, setOverrideJavaMemory] = useState(null);
  const [readFile, setReadFile] = useState(null);
  const [memory, setMemory] = useState(null);

  const updateJavaArguments = javaArguments => {
    setOverrideArgsInput(javaArguments);
  };

  // resetArgs the global arguments to the default one
  const resetArgs = async () => {
    updateJavaArguments(DEFAULT_ARGS);
    const modifiedConfig = JSON.stringify({
      ...readFile,
      overrideArgs: DEFAULT_ARGS
    });
    await promisify(fs.writeFile)(
      path.join(PACKS_PATH, props.instanceName, 'config.json'),
      modifiedConfig
    );
  };

  // Set the changed java arguments
  const updateArgs = async () => {
    if (overrideArgs) {
      const modifiedConfig = JSON.stringify({ ...readFile, overrideArgs });
      await promisify(fs.writeFile)(
        path.join(PACKS_PATH, props.instanceName, 'config.json'),
        modifiedConfig
      );
      updateJavaArguments(overrideArgs);
    } else message.error('Enter Valid Arguments');
  };

  async function configManagement() {
    try {
      const javaP = await findJavaHome();
      setIs64bit(checkJavaArch(javaP));
      const configFile = JSON.parse(
        await promisify(fs.readFile)(
          path.join(PACKS_PATH, props.instanceName, 'config.json')
        )
      );
      setReadFile(configFile);
      if (configFile.overrideMemory) {
        setJavaMemorySwitchState(true);
        setOverrideJavaMemory(configFile.overrideMemory);
        setMemory(configFile.overrideMemory);
      } else setJavaMemorySwitchState(false);

      if (configFile.overrideArgs) {
        setJavaArgsSwitchState(true);
        setOverrideArgsInput(configFile.overrideArgs);
      } else setJavaArgsSwitchState(false);
    } catch (err) {
      log.error(err.message);
    }
  }

  useEffect(() => {
    configManagement();
  }, []);

  async function toggleJavaArguments(e) {
    try {
      if (e) {
        const modifiedConfig = JSON.stringify({
          ...readFile,
          overrideArgs: DEFAULT_ARGS
        });
        await promisify(fs.writeFile)(
          path.join(PACKS_PATH, props.instanceName, 'config.json'),
          modifiedConfig
        );
        setOverrideArgsInput(DEFAULT_ARGS);
        setJavaArgsSwitchState(true);
      } else if (!e) {
        const modifiedConfig = JSON.stringify(_.omit(readFile, 'overrideArgs'));
        await promisify(fs.writeFile)(
          path.join(PACKS_PATH, props.instanceName, 'config.json'),
          modifiedConfig
        );
        setJavaArgsSwitchState(false);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function updateMemory(v) {
    try {
      const modifiedConfig = JSON.stringify({
        ...readFile,
        overrideMemory: v
      });
      await promisify(fs.writeFile)(
        path.join(PACKS_PATH, props.instanceName, 'config.json'),
        modifiedConfig
      );
      setOverrideJavaMemory(v);
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleJavaMemory(e) {
    try {
      if (e) {
        const modifiedConfig = JSON.stringify({
          ...readFile,
          overrideMemory: 4096
        });
        await promisify(fs.writeFile)(
          path.join(PACKS_PATH, props.instanceName, 'config.json'),
          modifiedConfig
        );
        setOverrideJavaMemory(4096);
        setJavaMemorySwitchState(true);
        setMemory(readFile.overrideMemory);
      } else if (!e) {
        const modifiedConfig = JSON.stringify(_.omit(readFile, 'overrideMemory'));
        await promisify(fs.writeFile)(
          path.join(PACKS_PATH, props.instanceName, 'config.json'),
          modifiedConfig
        );
        setJavaMemorySwitchState(false);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Card style={{ marginTop: 15, height: 'auto' }} title="Java Manager">
      <div style={{ display: 'inline', verticalAlign: 'middle' }}>
        <div className={styles.mainTextSlider}>
          Java Memory (
          {is64bit ? (
            '64 bit)'
          ) : (
            <span>
              32 bit)&nbsp;
              <Tooltip
                placement="right"
                title="Your system uses a 32 bit Java, which allows a maximum of 1.5GB to be used.
                 If you want more, install or select a 64 bit java executable"
              >
                <FontAwesomeIcon
                  className={styles.iconPointer}
                  icon={faQuestionCircle}
                />
              </Tooltip>
            </span>
          )}
          <Switch
            className={styles.sliderSwitch}
            onChange={e => toggleJavaMemory(e)}
            checked={javaMemorySwitchState}
          />
        </div>
        {javaMemorySwitchState ? (
          <MemorySlider
            hr={true}
            overrideJava={true}
            ram={overrideJavaMemory}
            is64bit={props.is64bit}
            updateMemory={updateMemory}
            javaArguments={overrideArgs}
            instanceName={props.instanceName}
            memory={memory}
          />
        ) : null}
      </div>

      <div style={{ display: 'inline', verticalAlign: 'middle' }}>
        <div className={styles.mainText}>
          Java Arguments
          <Switch
            className={styles.switch}
            onChange={e => toggleJavaArguments(e)}
            updateArgs={updateArgs}
            resetArgs={resetArgs}
            checked={javaArgsSwitchState}
          />
        </div>
        {javaArgsSwitchState ? (
          <JavaArgInput
            overrideArgs={overrideArgs}
            setOverrideArgsInput={setOverrideArgsInput}
            updateArgs={updateArgs}
            resetArgs={resetArgs}
          />
        ) : null}
      </div>
    </Card>
  );
}

function mapStateToProps(state) {
  return {
    settings: state.settings,
    javaArgs: state.settings.java.javaArgs
  };
}

const mapDispatchToProps = {
  setJavaArgs
};

export default Form.create()(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(JavaManagerCard)
);
