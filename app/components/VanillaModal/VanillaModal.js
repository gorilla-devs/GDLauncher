// @flow
import React, { Component } from 'react';
import { Select, Form, Input, Icon, Button, Checkbox, Cascader } from 'antd';
import styles from './VanillaModal.css';
import Modal from '../Common/Modal/Modal';

type Props = {};
const FormItem = Form.Item;
let pack;

class VanillaModal extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      checked: false,
      versions: [
        {
          value: 'releases',
          label: 'Releases',
          children: this.props.versionsManifest.filter(v => v.type === 'release').map((v) => { return { value: v.id, label: v.id } }),
        },
        {
          value: 'snapshots',
          label: 'Snapshots',
          children: this.props.versionsManifest.filter(v => v.type === 'snapshot').map((v) => { return { value: v.id, label: v.id } }),
        },
      ]
    };
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        this.props.createPack(values.version, values.packName);
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Modal history={this.props.history} mounted={this.props.modalState} title="Create New Instance" style={{ height: '80vh' }}>
        <Form layout="inline" className={styles.container} onSubmit={this.handleSubmit}>
          <div>
            <FormItem style={{ margin: 0 }}>
              {getFieldDecorator('packName', {
                rules: [{ required: true, message: 'Please input a name' }],
              })(
                <Input
                  size="large"
                  style={{ width: '50vw', display: 'inline-block', height: '60px' }}
                  prefix={<Icon type="play-circle-o" style={{ color: 'rgba(255,255,255,.8)' }} />}
                  placeholder="Instance Name"
                />
              )}
            </FormItem>
          </div>
          <div style={{ marginTop: '20px' }}>
            <FormItem>
              {getFieldDecorator('version', {
                rules: [{ required: true, message: 'Please select a version' }],
              })(
                <Cascader
                  options={this.state.versions}
                  size="large"
                  style={{ width: 200, display: 'inline-block' }}
                  placeholder="Select a version"
                />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('snapshots', {
                valuePropName: 'checked',
                initialValue: false,
              })(
                <Checkbox onChange={(checked) => this.setState({ checked: checked.target.checked })}>Show Snapshots</Checkbox>
              )}
            </FormItem>
          </div>
          <div className={styles.createInstance}>
            <Button loading={this.state.loading} icon="plus" size="large" type="primary" htmlType="submit" >
              Create Instance
            </Button>
          </div>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(VanillaModal);
