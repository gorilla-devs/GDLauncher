// @flow
import React, { Component } from 'react';
import { Select, Form, Input, Icon, Button, Modal } from 'antd';
import styles from './VanillaModal.css';
import { resetModalStatus } from '../../actions/packManager';

type Props = {};
const FormItem = Form.Item;
let pack;

class VanillaModal extends Component<Props> {
  props: Props;
  componentDidMount = () => {
    // Downloads the versions list just the first time
    if (this.props.versionsManifest.length === 0)
      this.props.getVanillaMCVersions();
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.pack = values.packName;
        this.props.createPack(
          this.props.versionsManifest.find(
            (version) =>
              version.id === values.version).url,
          values.packName);
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    if (this.props.fetchedData) {
      this.props.closeModal(true, this.pack);
      this.props.resetModalStatus();
    }

    return (
      <Modal
        visible={this.props.visible}
        footer={null}
        onCancel={this.props.closeModal}
        title="Install Vanilla Minecraft"
        destroyOnClose="true"
      >
        <Form onSubmit={this.handleSubmit}>
          <FormItem>
            {getFieldDecorator('packName', {
              rules: [{ required: true, message: 'Please input a name' }],
            })(
              <Input
                size="large"
                prefix={<Icon type="play-circle-o" style={{ color: 'rgba(255,255,255,.8)' }} />}
                placeholder="Instance Name"
              />
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('version', {
              rules: [{ required: true, message: 'Please select a version' }],
            })(
              <Select
                showSearch
                style={{ width: 200 }}
                placeholder="Select a version"
                optionFilterProp="children"
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                <Select.OptGroup label="Snapshots">
                  {this.props.versionsManifest.map((version) => version.type === 'snapshot' && <Select.Option key={version.id}>{version.id}</Select.Option>)}
                </Select.OptGroup>
                <Select.OptGroup label="Releases">
                  {this.props.versionsManifest.map((version) => version.type === 'release' && <Select.Option key={version.id}>{version.id}</Select.Option>)}
                </Select.OptGroup>
              </Select>
            )}
          </FormItem>
          <Button loading={this.props.loadingData} icon="plus" size="large" type="primary" htmlType="submit" >
            Create Instance
          </Button>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(VanillaModal);
