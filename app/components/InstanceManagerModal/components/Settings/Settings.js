import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Select, Form, Input, Icon, Button, Checkbox } from 'antd';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import fsa from 'fs-extra';
import path from 'path';
import styles from './Settings.scss';

const FormItem = Form.Item;
type Props = {};

class Instances extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      deletingInstances: false
    };
  }


  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <Form layout="inline" onSubmit={this.handleSubmit}>
          <div>
            <FormItem style={{ margin: 0 }}>
              {getFieldDecorator('packName', {
                rules: [{ required: true, message: 'Please input a name' }],
                initialValue: this.props.match.params.instance,
              })(
                <Input
                  size="large"
                  style={{ width: '50vw', display: 'inline-block', height: '60px' }}
                  prefix={<Icon type="play-circle" theme="filled" style={{ color: 'rgba(255,255,255,.8)' }} />}
                  placeholder="Instance Name"
                />
              )}
            </FormItem>
          </div>
          <div style={{ marginTop: '20px' }}>
            <FormItem>
              {getFieldDecorator('snapshots', {
                valuePropName: 'checked',
                initialValue: false,
              })(
                <Checkbox>Show Snapshots</Checkbox>
              )}
            </FormItem>
          </div>
          {/* <div className={styles.save}>
            <Button icon="save" size="large" type="primary" htmlType="submit" >
              Save
            </Button>
          </div> */}
        </Form>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {};
}


export default Form.create()(connect(mapStateToProps)(Instances));
