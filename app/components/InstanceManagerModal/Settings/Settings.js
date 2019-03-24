import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { routerActions } from 'connected-react-router';
import { bindActionCreators } from 'redux';
import { Form, Input, Icon, Button, message, Slider, Switch } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo, faCheck } from '@fortawesome/free-solid-svg-icons';
import path from 'path';
import { promisify } from 'util';
import fs, { stat } from 'fs';
import log from 'electron-log';
import Card from '../../Common/Card/Card';
import { PACKS_PATH } from '../../../constants';
import styles from './Settings.scss';
import JavaMemorySlider from './javaMemorySlider';
import { history } from '../../../store/configureStore';
import { setOverrideJavaMemory, setJavaArgs, setOverrideJavaArgs } from '../../../actions/settings';
import ForgeManager from './ForgeManager';
import { DEFAULT_ARGS } from '../../../constants';

const FormItem = Form.Item;

type Props = {
  setJavaArgs: () => void,
  setOverrideJavaArgs: () => void,
  javaArgs: string,
  overrideJavaArgs: string
};

function Instances(props: Props) {
  const { overrideJavaArgs } = props;

  const [is64bit, setIs64bit] = useState(true);
  const [instanceConfig, setInstanceConfig] = useState(null);
  const [checkingForge, setCheckingForge] = useState(true);
  const [unMounting, setUnMounting] = useState(false);
  const [overrideArgs, setOverrideArgsInput] = useState(overrideJavaArgs);

  let watcher = null;

  const updateJavaArguments = javaArguments => {
    setOverrideArgsInput(javaArguments);
    props.setOverrideJavaArgs(javaArguments);
  };

  // Reset the global arguments to the default one
  const reset = async () => {
    updateJavaArguments(DEFAULT_ARGS);
    const config = JSON.parse(
      await promisify(fs.readFile)(
        path.join(PACKS_PATH, props.instance, 'config.json')
      )
    );
    config.overrideArgs = DEFAULT_ARGS;
    const config2 = JSON.stringify(config);
    console.log(config2);
    await promisify(fs.writeFile)(
      path.join(PACKS_PATH, props.instance, 'config.json'),
      config2
    );
  };

  // Set the changed java arguments
  const submit = async () => {
    props.setOverrideJavaArgs(overrideArgs);
    console.log(props.settings.java.memory, 'diopeppe');
    if (overrideArgs) {
      const config = JSON.parse(
        await promisify(fs.readFile)(
          path.join(PACKS_PATH, props.instance, 'config.json')
        )
      );
      config.overrideArgs = overrideArgs;
      const config2 = JSON.stringify(config);
      console.log(config2);
      await promisify(fs.writeFile)(
        path.join(PACKS_PATH, props.instance, 'config.json'),
        config2
      );
      updateJavaArguments(overrideArgs);
    } else message.error('Enter Valid Arguments');
  };

  async function configManagment() {
    try {
      let config = JSON.parse(
        await promisify(fs.readFile)(
          path.join(PACKS_PATH, props.instance, 'config.json')
        )
      );
      //this.setState({ instanceConfig: config });
      setInstanceConfig(config);
      watcher = fs.watch(
        path.join(PACKS_PATH, props.instance, 'config.json'),
        { encoding: 'utf8' },
        async (eventType, filename) => {
          config = JSON.parse(
            await promisify(fs.readFile)(
              path.join(PACKS_PATH, props.instance, 'config.json')
            )
          );
          setInstanceConfig(config);
          //this.setState({ instanceConfig: config });
        }
      );
    } catch (err) {
      log.error(err.message);
    } finally {
      setCheckingForge(false);
      //this.setState({ checkingForge: false });
    }
  }

  useEffect(() => {
    configManagment();
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
          const packFolder = path.join(PACKS_PATH, props.instance);
          const newPackFolder = path.join(PACKS_PATH, values.packName);
          await promisify(fs.rename)(packFolder, newPackFolder);
          props.close();
        }
      }
    });
  }

  const { getFieldDecorator } = props.form;
  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <div className={styles.content}>
          <h2>Edit Instance Settings</h2>
          <Form layout="inline" onSubmit={e => handleSubmit(e)}>
            <div>
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  height: '60px',
                  margin: 0,
                  overflowY: 'auto'
                }}
              >
                <FormItem>
                  {getFieldDecorator('packName', {
                    rules: [
                      {
                        required: true,
                        message: 'Please input a valid name',
                        pattern: new RegExp(
                          '^[a-zA-Z0-9_.-]+( [a-zA-Z0-9_.-]+)*$'
                        )
                      }
                    ],
                    initialValue: props.instance
                  })(
                    <Input
                      size="large"
                      style={{
                        width: 300,
                        display: 'inline-block',
                        height: 60
                      }}
                      prefix={
                        <Icon
                          type="play-circle"
                          theme="filled"
                          style={{ color: 'rgba(255,255,255,.8)' }}
                        />
                      }
                      placeholder="Instance Name"
                    />
                  )}
                </FormItem>
                <Button
                  icon="save"
                  size="large"
                  type="primary"
                  htmlType="submit"
                  style={{
                    width: 150,
                    display: 'inline-block',
                    height: 60
                  }}
                >
                  Rename
                </Button>
              </div>
            </div>
          </Form>
          <Card style={{ marginTop: 15 }} title="Forge Manager">
            {!checkingForge ? (
              <ForgeManager
                name={props.instance}
                data={instanceConfig}
                closeModal={props.close}
              />
            ) : null}
          </Card>

          <Card style={{ marginTop: 15, height: 200 }} title="Java Manager">
            <JavaMemorySlider
              ram={props.settings.java.overrideMemory}
              is64bit={is64bit}
              updateMemory={props.setOverrideJavaMemory}
              javaArguments={overrideArgs}
              instanceName={props.instance}
            />
            <div style={{ display: 'inline', verticalAlign: 'middle' }}>
              <Input
                value={overrideArgs}
                style={{
                  display: 'inline-block',
                  maxWidth: '76%',
                  marginRight: '10px',
                  marginBottom: 10,
                  marginTop: 4,
                  backgroundColor: 'var(--secondary-color-1)'
                }}
                onChange={e => setOverrideArgsInput(e.target.value)}
              />

              <Button.Group
                style={{
                  maxWidth: '60%',
                  marginBottom: 10,
                  marginTop: 4
                }}
              >
                <Button
                  style={{
                    maxWidth: '60%',
                    marginBottom: 10,
                    marginTop: 4
                  }}
                  onClick={() => submit()}
                  type="primary"
                >
                  <FontAwesomeIcon icon={faCheck} />
                </Button>
                <Button
                  style={{
                    maxWidth: '60%',
                    marginBottom: 10,
                    marginTop: 4
                  }}
                  type="primary"
                  onClick={() => reset()}
                >
                  <FontAwesomeIcon icon={faUndo} />
                </Button>
              </Button.Group>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    settings: state.settings,
    javaArgs: state.settings.java.javaArgs,
    overrideJavaArgs: state.settings.java.overrideJavaArgs,
    overrideMemory: state.settings.java.overrideMemory
  };
}

const mapDispatchToProps = {
  setOverrideJavaMemory,
  setOverrideJavaArgs,
  setJavaArgs
};

export default Form.create()(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Instances)
);
