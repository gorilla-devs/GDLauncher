import React, { useState, useEffect } from 'react';
import { Form, Switch, Tooltip } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import log from 'electron-log';
import Card from '../../Common/Card/Card';
import styles from './JavaManagerCard.scss';
import { DEFAULT_ARGS, DEFAULT_MEMORY } from '../../../constants';
import { findJavaHome, checkJavaArch } from '../../../utils/javaHelpers';
import { updateConfig, readConfig } from '../../../utils/instances';
import JavaMemorySlider from '../../Settings/components/JavaManager/javaMemorySlider';
import JavaArgInput from '../../Common/JavaArgumentInput';

function JavaManagerCard(props) {
  const [is64bit, setIs64bit] = useState(true);
  const [overrideArgs, setOverrideArgsInput] = useState(null);
  const [javaArgsSwitchState, setJavaArgsSwitchState] = useState(false);
  const [javaMemorySwitchState, setJavaMemorySwitchState] = useState(false);
  const [overrideJavaMemory, setOverrideJavaMemory] = useState(null);

  const resetArgs = async () => {
    await updateConfig(props.instanceName, { overrideArgs: DEFAULT_ARGS });
    setOverrideArgsInput(DEFAULT_ARGS);
  };

  // Set the changed java arguments
  const updateArgs = async val => {
    await updateConfig(props.instanceName, { overrideArgs: val });
  };

  async function configManagement() {
    try {
      const javaP = await findJavaHome();
      setIs64bit(checkJavaArch(javaP));
      const configFile = await readConfig(props.instanceName);
      if (configFile.overrideMemory) {
        setJavaMemorySwitchState(true);
        setOverrideJavaMemory(configFile.overrideMemory);
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
        await updateConfig(props.instanceName, { overrideArgs: DEFAULT_ARGS });
        setOverrideArgsInput(DEFAULT_ARGS);
        setJavaArgsSwitchState(true);
      } else if (!e) {
        await updateConfig(props.instanceName, {}, ['overrideArgs']);
        setJavaArgsSwitchState(false);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function updateMemory(overrideMemory) {
    try {
      await updateConfig(props.instanceName, { overrideMemory });
      setOverrideJavaMemory(overrideMemory);
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleJavaMemory(e) {
    try {
      if (e) {
        await updateConfig(props.instanceName, {
          overrideMemory: DEFAULT_MEMORY
        });
        setOverrideJavaMemory(DEFAULT_MEMORY);
        setJavaMemorySwitchState(true);
      } else if (!e) {
        await updateConfig(props.instanceName, {}, ['overrideMemory']);
        setJavaMemorySwitchState(false);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const MemorySlider = () => (
    <div>
      {overrideJavaMemory && (
        <JavaMemorySlider
          hr
          overrideJava
          ram={overrideJavaMemory}
          is64bit={is64bit}
          updateMemory={updateMemory}
          javaArguments={overrideArgs}
          instanceName={props.instanceName}
        />
      )}
    </div>
  );

  return (
    <Card
      style={{ marginTop: 15, height: 'auto' }}
      title="Java Manager Override"
    >
      <div style={{ padding: 10 }}>
        <div className={styles.mainTextSlider}>
          Java Memory (
          {is64bit ? (
            '64 bit)'
          ) : (
            <React.Fragment>
              32 bit)&nbsp;
              <Tooltip
                placement="right"
                title="Your system uses a 32 bit Java, which allows a maximum of 1.5GB to be used. If you want more, install or select a 64 bit java executable"
              >
                <FontAwesomeIcon
                  className={styles.iconPointer}
                  icon={faQuestionCircle}
                />
              </Tooltip>
            </React.Fragment>
          )}
          <Switch
            className={styles.sliderSwitch}
            onChange={e => toggleJavaMemory(e)}
            checked={javaMemorySwitchState}
          />
        </div>
        {javaMemorySwitchState && <MemorySlider />}

        <div className={styles.mainText}>
          <div>Java Arguments</div>
          <Switch
            className={styles.switch}
            onChange={e => toggleJavaArguments(e)}
            checked={javaArgsSwitchState}
          />
        </div>
        {javaArgsSwitchState && (
          <JavaArgInput
            overrideArgs={overrideArgs}
            onChange={setOverrideArgsInput}
            updateArgs={updateArgs}
            resetArgs={resetArgs}
            invertedStyle
          />
        )}
      </div>
    </Card>
  );
}

export default Form.create()(JavaManagerCard);
