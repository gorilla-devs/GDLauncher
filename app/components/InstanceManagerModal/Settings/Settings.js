import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Select, Form, Input, Icon, Button, Checkbox } from 'antd';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import fsa from 'fs-extra';
import path from 'path';
import { promisify } from 'util';
import fs from 'fs';
import log from 'electron-log';
import Card from '../../Common/Card/Card';
import { PACKS_PATH } from '../../../constants';
import styles from './Settings.scss';
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
      checkingForge: true
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

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <h2>Edit Instance Settings</h2>
        <Form layout="inline" onSubmit={this.handleSubmit}>
          <div>
            <FormItem style={{ margin: 0 }}>
              {getFieldDecorator('packName', {
                rules: [{ required: true, message: 'Please input a name' }],
                initialValue: this.props.instance
              })(
                <Input
                  size="large"
                  style={{
                    width: '50vw',
                    display: 'inline-block',
                    height: '60px'
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
          </div>
          <Card style={{ marginTop: 15 }} title="Forge Manager">
            {!this.state.checkingForge ? (
              <ForgeManager
                name={this.props.instance}
                data={this.state.instanceConfig}
              />
            ) : null}
          </Card>
          <div className={styles.save}>
            <Button icon="save" size="large" type="primary" htmlType="submit">
              Save
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

export default Form.create()(connect(mapStateToProps)(Instances));
