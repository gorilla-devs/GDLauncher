import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { routerActions } from 'connected-react-router';
import { bindActionCreators } from 'redux';
import {
  Form,
  Input,
  Icon,
  Button,
  message,
  Slider,
  Switch,
  Tooltip
} from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo, faCheck } from '@fortawesome/free-solid-svg-icons';
import path from 'path';
import { promisify } from 'util';
import fs, { stat } from 'fs';
import process from 'process';
import log from 'electron-log';
import _ from 'lodash';
import Card from '../../Common/Card/Card';
import styles from './JavaManagerCard.scss';
import JavaMemorySlider from '../../Settings/components/JavaManager/javaMemorySlider';
import { PACKS_PATH, DEFAULT_ARGS } from '../../../constants';
import { history } from '../../../store/configureStore';
import { setJavaArgs } from '../../../actions/settings';
import ForgeManager from './ForgeManager';
import { func } from 'prop-types';

const FormItem = Form.Item;

type Props = {
  setJavaArgs: () => void,
  javaArgs: string,
  overrideJavaArgs: string
};

function JavaManagerCard(props: Props) {
  const { overrideJavaArgs } = props;

  const [is64bit, setIs64bit] = useState(true);
  const [instanceConfig, setInstanceConfig] = useState(null);
  const [checkingForge, setCheckingForge] = useState(true);
  const [unMounting, setUnMounting] = useState(false);
  const [overrideArgs, setOverrideArgsInput] = useState(null);
  const [javaArgsSwitchState, setJavaArgsSwitchState] = useState(false);
  const [javaMemorySwitchState, setJavaMemorySwitchState] = useState(false);
  const [overrideJavaMemory, setOverrideJavaMemory] = useState(null);
  const [memory, setMemory] = useState(null);

  let watcher = null;

  const updateJavaArguments = javaArguments => {
    setOverrideArgsInput(javaArguments);
  };

  // resetArgs the global arguments to the default one
  const resetArgs = async () => {
    updateJavaArguments(DEFAULT_ARGS);
    const config = JSON.parse(
      await promisify(fs.readFile)(
        path.join(PACKS_PATH, props.instanceName, 'config.json')
      )
    );
    const modifiedConfig = JSON.stringify({
      ...config,
      overrideArgs: DEFAULT_ARGS
    });
    await promisify(fs.writeFile)(
      path.join(PACKS_PATH, props.instanceName, 'config.json'),
      modifiedConfig
    );
  };

  function isOsWin64() {
    if (process.arch === 'x64') {
      return true;
    } else return false;
  }

  // Set the changed java arguments
  const updateArgs = async () => {
    if (overrideArgs) {
      const config = JSON.parse(
        await promisify(fs.readFile)(
          path.join(PACKS_PATH, props.instanceName, 'config.json')
        )
      );
      const modifiedConfig = JSON.stringify({ ...config, overrideArgs });
      await promisify(fs.writeFile)(
        path.join(PACKS_PATH, props.instanceName, 'config.json'),
        modifiedConfig
      );
      updateJavaArguments(overrideArgs);
    } else message.error('Enter Valid Arguments');
  };

  async function configManagement() {
    try {
      const configFile = JSON.parse(
        await promisify(fs.readFile)(
          path.join(PACKS_PATH, props.instanceName, 'config.json')
        )
      );
      if (configFile.overrideMemory) {
        setJavaMemorySwitchState(true);
        setOverrideJavaMemory(configFile.overrideMemory);
        setMemory(configFile.overrideMemory);
      } else setJavaMemorySwitchState(false);

      if (configFile.overrideArgs) {
        setJavaArgsSwitchState(true);
        setOverrideArgsInput(configFile.overrideArgs);
      } else setJavaArgsSwitchState(false);

      setInstanceConfig(configFile);

      watcher = fs.watch(
        path.join(PACKS_PATH, props.instanceName, 'config.json'),
        { encoding: 'utf8' },
        async (eventType, filename) => {
          const config = JSON.parse(
            await promisify(fs.readFile)(
              path.join(PACKS_PATH, props.instanceName, 'config.json')
            )
          );
          setInstanceConfig(config);
        }
      );
    } catch (err) {
      log.error(err.message);
    } finally {
      setCheckingForge(false);
    }
  }

  useEffect(() => {
    configManagement();
    return () => {
      watcher.close();
    };
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    props.form.validateFields(async (err, values) => {
      if (!err) {
        try {
          await promisify(fs.access)(path.join(PACKS_PATH, values.packName));
          message.warning('An instance with this name already exists.');
        } catch (err) {
          const packFolder = path.join(PACKS_PATH, props.instanceName);
          const newPackFolder = path.join(PACKS_PATH, values.packName);
          await promisify(fs.rename)(packFolder, newPackFolder);
          props.close();
        }
      }
    });
  }

  async function toggleJavaArguments(e) {
    try {
      const config = JSON.parse(
        await promisify(fs.readFile)(
          path.join(PACKS_PATH, props.instanceName, 'config.json')
        )
      );
      if (config.overrideArgs === undefined && e) {
        const modifiedConfig = JSON.stringify({
          ...config,
          overrideArgs: DEFAULT_ARGS
        });
        await promisify(fs.writeFile)(
          path.join(PACKS_PATH, props.instanceName, 'config.json'),
          modifiedConfig
        );
        setOverrideArgsInput(DEFAULT_ARGS);
        setJavaArgsSwitchState(true);
      } else if (config.overrideArgs && !e) {
        const modifiedConfig = JSON.stringify(_.omit(config, 'overrideArgs'));
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
      const config = JSON.parse(
        await promisify(fs.readFile)(
          path.join(PACKS_PATH, props.instanceName, 'config.json')
        )
      );
      const modifiedConfig = JSON.stringify({
        ...config,
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
      const config = JSON.parse(
        await promisify(fs.readFile)(
          path.join(PACKS_PATH, props.instanceName, 'config.json')
        )
      );
      if (config.overrideMemory === undefined && e) {
        const modifiedConfig = JSON.stringify({
          ...config,
          overrideMemory: 4096
        });
        await promisify(fs.writeFile)(
          path.join(PACKS_PATH, props.instanceName, 'config.json'),
          modifiedConfig
        );
        setOverrideJavaMemory(4096);
        setJavaMemorySwitchState(true);
        const configChanged = JSON.parse(
          await promisify(fs.readFile)(
            path.join(PACKS_PATH, props.instanceName, 'config.json')
          )
        );
        setMemory(configChanged.overrideMemory);
      } else if (config.overrideMemory !== undefined && !e) {
        const modifiedConfig = JSON.stringify(_.omit(config, 'overrideMemory'));
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

  const javaArgInput = (
    <div>
      <Input
        value={overrideArgs}
        style={{
          display: 'inline-block',
          maxWidth: '74%',
          marginRight: '10px',
          marginBottom: 4,
          marginTop: 4,
          backgroundColor: 'var(--secondary-color-1)',
          marginLeft: '1%'
        }}
        onChange={e => setOverrideArgsInput(e.target.value)}
      />
      <Button.Group
        style={{
          maxWidth: '60%',
          marginBottom: 4,
          marginTop: 4
        }}
      >
        <Button
          style={{
            maxWidth: '60%',
            marginBottom: 4,
            marginTop: 4
          }}
          onClick={() => updateArgs()}
          type="primary"
        >
          <FontAwesomeIcon icon={faCheck} />
        </Button>
        <Button
          style={{
            maxWidth: '60%',
            marginBottom: 4,
            marginTop: 4
          }}
          type="primary"
          onClick={() => resetArgs()}
        >
          <FontAwesomeIcon icon={faUndo} />
        </Button>
      </Button.Group>
    </div>
  );

  const memorySlider = (
    <div>
      {memory && (
        <JavaMemorySlider
          // ram={props.settings.java.overrideMemory}
          hr={true}
          overrideJava={true}
          ram={overrideJavaMemory}
          is64bit={props.is64bit}
          updateMemory={updateMemory}
          javaArguments={overrideArgs}
          instanceName={props.instanceName}
        />
      )}
    </div>
  );

  const { getFieldDecorator } = props.form;
  return (
    <Card style={{ marginTop: 15, height: 'auto' }} title="Java Manager">
      <div style={{ display: 'inline', verticalAlign: 'middle' }}>
        <div className={styles.mainTextSlider}>
          Java Memory (
          {isOsWin64 ? (
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
        {javaMemorySwitchState ? memorySlider : null}
      </div>

      <div style={{ display: 'inline', verticalAlign: 'middle' }}>
        <div className={styles.mainText}>
          Java Arguments
          <Switch
            className={styles.switch}
            onChange={e => toggleJavaArguments(e)}
            checked={javaArgsSwitchState}
          />
        </div>
        {javaArgsSwitchState ? javaArgInput : null}
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
