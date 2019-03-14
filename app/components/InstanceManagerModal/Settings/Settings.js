import React, { Component } from 'react';
import { connect } from 'react-redux';
import { routerActions } from 'connected-react-router';
import { bindActionCreators } from 'redux';
import { Form, Input, Icon, Button, message } from 'antd';
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
type Props = {};

let watcher = null;

class Instances extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      instanceConfig: null,
      checkingForge: true,
      unMounting: false
    };
  }

  componentDidMount = async () => {
    try {
      let config = JSON.parse(
        await promisify(fs.readFile)(
          path.join(PACKS_PATH, this.props.instance, 'config.json')
        )
      );
      this.setState({ instanceConfig: config });
      watcher = fs.watch(
        path.join(PACKS_PATH, this.props.instance, 'config.json'),
        { encoding: 'utf8' },
        async (eventType, filename) => {
          config = JSON.parse(
            await promisify(fs.readFile)(
              path.join(PACKS_PATH, this.props.instance, 'config.json')
            )
          );
          this.setState({ instanceConfig: config });
        }
      );
    } catch (err) {
      log.error(err.message);
    } finally {
      this.setState({ checkingForge: false });
    }
  };

  componentWillUnmount = () => {
    watcher.close();
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        try {
          await promisify(fs.access)(path.join(PACKS_PATH, values.packName));
          message.warning('An instance with this name already exists.');
        } catch (err) {
          const packFolder = path.join(PACKS_PATH, this.props.instance);
          const newPackFolder = path.join(PACKS_PATH, values.packName);
          await promisify(fs.rename)(packFolder, newPackFolder);
          this.props.close();
        }
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <h2>Edit Instance Settings</h2>
        <Form layout="inline" onSubmit={this.handleSubmit}>
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
                  initialValue: this.props.instance
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
          {!this.state.checkingForge ? (
            <ForgeManager
              name={this.props.instance}
              data={this.state.instanceConfig}
              closeModal={this.props.close}
            />
          ) : null}
        </Card>

        <Card style={{ marginTop: 15, maxHeight: 150 }} title="Override Global Java Arguments">
          <div style={{ display: 'inline' }}>
            <Input className={styles.javaArginput}/>
            <Button.Group>
              <Button type="primary" >Set</Button>
              <Button type="primary" >reset</Button>
            </Button.Group>
          </div>
        </Card>

      </div>
    );
  }
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
