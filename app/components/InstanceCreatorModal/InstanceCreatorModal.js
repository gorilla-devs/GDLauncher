// @flow
import React, { Component } from 'react';
import { Select, Form, Input, Icon, Button, Checkbox, Cascader, Switch } from 'antd';
import vSort from 'version-sort';
import _ from 'lodash';
import styles from './InstanceCreatorModal.scss';
import Modal from '../Common/Modal/Modal';

type Props = {};
const FormItem = Form.Item;
let pack;

class InstanceCreatorModal extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      checked: false,
      versions: [{
        value: 'vanilla',
        label: 'Vanilla',
        children: [{
          value: 'releases',
          label: 'Releases',
          children: this.props.versionsManifest.filter(v => v.type === 'release').map((v) => { return { value: v.id, label: v.id } }),
        },
        {
          value: 'snapshots',
          label: 'Snapshots',
          children: this.props.versionsManifest.filter(v => v.type === 'snapshot').map((v) => { return { value: v.id, label: v.id } }),
        }]
      },
      {
        value: 'forge',
        label: 'Forge',
        children: _.reverse(vSort(_.without(Object.keys(this.props.forgeManifest), '1.7.10_pre4'))).map(
          (v) => {
            return {
              value: v,
              label: v,
              children: _.reverse(this.props.forgeManifest[v]).map(ver => {
                return {
                  value: ver,
                  label: ver,
                }
              })
            }
          }
        ),
      }]
    };
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (values.version[0] === 'vanilla') {
          this.props.createPack(values.version[2], values.packName);
        } else if (values.version[0] === 'forge') {
          this.props.createPack(values.version[1], values.packName, values.version[2]);
        }
        this.setState({ loading: true });
        setTimeout(() => {
          this.setState({ loading: false });
        }, 500);
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
                  autoFocus
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
              {getFieldDecorator('version', {
                rules: [{ required: true, message: 'Please select a version' }],
              })(
                <Cascader
                  options={this.state.versions}
                  size="large"
                  style={{ width: 335, display: 'inline-block' }}
                  placeholder="Select a version"
                />
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

export default Form.create()(InstanceCreatorModal);
