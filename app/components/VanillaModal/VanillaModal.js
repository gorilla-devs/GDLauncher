// @flow
import React, { Component } from 'react';
import { Select, Form, Input, Icon, Button, Checkbox } from 'antd';
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
      checked: false
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
      <Modal history={this.props.history} mounted={this.props.modalState} style={{ height: '60vh' }}>
        <Form layout="inline" className={styles.container} onSubmit={this.handleSubmit}>
          <div>
            <FormItem>
              {getFieldDecorator('packName', {
                rules: [{ required: true, message: 'Please input a name' }],
              })(
                <Input
                  size="large"
                  style={{ width: '40vw', display: 'inline-block', height: '60px' }}
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
                <Select
                  showSearch
                  size="large"
                  style={{ width: 200, display: 'inline-block' }}
                  placeholder="Select a version"
                  optionFilterProp="children"
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  <Select.OptGroup label="Releases">
                    {this.props.versionsManifest.map((version) => version.type === 'release' && <Select.Option key={version.id}>{version.id}</Select.Option>)}
                  </Select.OptGroup>
                  {this.state.checked &&
                    <Select.OptGroup label="Snapshots">
                      {this.props.versionsManifest.map((version) => version.type === 'snapshot' && <Select.Option key={version.id}>{version.id}</Select.Option>)}
                    </Select.OptGroup>
                  }
                </Select>
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
