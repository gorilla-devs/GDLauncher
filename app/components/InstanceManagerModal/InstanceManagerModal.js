// @flow
import React, { Component } from 'react';
import { Select, Form, Input, Icon, Button, Checkbox } from 'antd';
import styles from './InstanceManagerModal.scss';
import Modal from '../Common/Modal/Modal';

type Props = {};
const FormItem = Form.Item;
let pack;

class InstanceManagerModal extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {

      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal history={this.props.history} title={`Editing ${this.props.match.params.instance}`} style={{ height: '60vh' }}>
        <Form layout="inline" className={styles.container} onSubmit={this.handleSubmit}>
          <div>
            <FormItem style={{ margin: 0 }}>
              {getFieldDecorator('packName', {
                rules: [{ required: true, message: 'Please input a name' }],
                initialValue: this.props.match.params.instance,
              })(
                <Input
                  size="large"
                  style={{ width: '50vw', display: 'inline-block', height: '60px' }}
                  prefix={<Icon type="play-circle-o" theme="filled" style={{ color: 'rgba(255,255,255,.8)' }} />}
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
          <div className={styles.createInstance}>
            <Button icon="plus" size="large" type="primary" htmlType="submit" >
              Edit
            </Button>
          </div>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(InstanceManagerModal);
