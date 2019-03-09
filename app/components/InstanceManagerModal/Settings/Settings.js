import React, { Component, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { routerActions } from 'connected-react-router';
import { bindActionCreators } from 'redux';
import { Form, Input, Icon, Button, message, Switch } from 'antd';
import path from 'path';
import { promisify } from 'util';
import fs from 'fs';
import log from 'electron-log';
import Card from '../../Common/Card/Card';
import { PACKS_PATH } from '../../../constants';
import styles from './Settings.scss';
import { history } from '../../../store/configureStore';
import ForgeManager from './ForgeManager';

const FormItem = Form.Item;

let watcher = null;

function Instances(props) {
  const [instanceConfig, setInstanceConfig] = useState(null);
  const [checkingForge, setCheckingForge] = useState(true);
  const [unMounting, setUnMounting] = useState(false);

  async function ReadConfig(){
    try {
      let config = JSON.parse(
        await promisify(fs.readFile)(
          path.join(PACKS_PATH, props.instance, 'config.json')
        )
      );
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
        }
      );
    } catch (err) {
      log.error(err.message);
    } finally {
      setCheckingForge(false);
    }

  }

  useEffect(() => {
    ReadConfig();
    return () => {
      watcher.close();
    }
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
  };

  function OverrideArgs() {

  }

  const { getFieldDecorator } = props.form;
  return (
    <div>
      <h2>Edit Instance Settings</h2>
      <Form layout="inline" onSubmit={(e) => handleSubmit(e)}>
        <div>
          <div
            style={{
              width: '100%',
              display: 'flex',
              height: '60px',
              margin: 0
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

      <Card style={{ marginTop: 15, maxHeight: 150 }} title="Override global java arguments">
        <div style={{ display: 'inline' }}>
          <Input className={styles.JavaArginput} />
          <Button type="primary" >Set</Button>
          <Switch className={styles.JavaArgswitch} onChange={() => OverrideArgs()} ></Switch>
        </div>
      </Card>

    </div>
  );
}

function mapStateToProps(state) {
  return {};
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      goBack: routerActions.goBack
    },
    dispatch
  );
}

export default Form.create()(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Instances)
);
