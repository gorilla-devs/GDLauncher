// @flow
import React, { Component } from 'react';
import { Select, Form, Input, Icon, Button } from 'antd';
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
      loading: false
    };
  }

  componentWillMount() {
    this.props.resetModalState();
  }

  componentDidMount = () => {
    // Downloads the versions list just the first time
    if (this.props.versionsManifest.length === 0) {
      this.props.getVanillaMCVersions();
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        this.props.createPack(
          this.props.versionsManifest.find(
            (version) => version.id === values.version).url,
          values.packName);
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Modal history={this.props.history} mounted={this.props.modalState}>
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
          <Button loading={this.state.loading} icon="plus" size="large" type="primary" htmlType="submit" >
            Create Instance
          </Button>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(VanillaModal);
