// @flow
import React, { Component } from 'react';
import { message, Form, Input, Icon, Button, Cascader } from 'antd';
import path from 'path';
import { promisify } from 'util';
import fs from 'fs';
import vSort from 'version-sort';
import _ from 'lodash';
import { PACKS_PATH, SERVERS_PATH } from '../../constants';
import Modal from '../Common/Modal/Modal';
import axios from 'axios';
import { downloadFile } from '../../utils/downloader';
import styles from './ServerCreatorModal.scss';
import { connect } from 'react-redux';

type Props = {};
const FormItem = Form.Item;


class ServerCreatorModal extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    const { forgeManifest, versionsManifest } = props;
    this.state = {
      unMount: false,
      selectedVersion: [],
      versions: [
        {
          value: 'vanilla',
          label: 'Vanilla',
          children: [
            {
              value: 'releases',
              label: 'Releases',
              children: versionsManifest
                .filter(v => v.type === 'release')
                .map(v => ({
                  value: v.id,
                  label: v.id
                }))
            },
            {
              value: 'snapshots',
              label: 'Snapshots',
              children: versionsManifest
                .filter(v => v.type === 'snapshot')
                .map(v => ({
                  value: v.id,
                  label: v.id
                }))
            }
          ]
        },
        {
          value: 'forge',
          label: 'Forge',
          // _.reverse mutates arrays so we make a copy of it first using .slice() and then we reverse it
          children: _.reverse(vSort(Object.keys(forgeManifest).slice())).map(
            v => ({
              value: v,
              label: v,
              // same as above
              children: _.reverse(forgeManifest[v].slice()).map(ver => ({
                value: Object.keys(ver)[0],
                label: Object.keys(ver)[0]
              }))
            })
          )
        }
      ],
      loading: false
    };
  }


  serverDownload = e => {
    e.preventDefault();
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        this.setState({ loading: true });
        const url = this.props.versionsManifest.find(v => v.id === this.state.selectedVersion[2]).url;
        const { data } = await axios.get(url);
        await downloadFile(
          path.join(SERVERS_PATH, values.packName, `${values.packName}.jar`),
          data.downloads.server.url,
          () => { }
        );
        const eulaFile = "eula=true"
        await promisify(fs.writeFile)(path.join(SERVERS_PATH, values.packName,"eula.txt"), eulaFile);
        this.setState({
          unMount: true,
          loading: false
        })
      }
    });
  }


  filter = (inputValue, pathy) => pathy[2].label.indexOf(inputValue) > -1;

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Modal
        history={this.props.history}
        title="Create New Instance"
        style={{ height: '80vh' }}
        unMount={this.state.unMount}
      >

        <Form
          layout="inline"
          className={styles.container}
          onSubmit={this.serverDownload}
        >
          <div>
            <FormItem style={{ margin: 0 }}>
              {getFieldDecorator('packName', {
                rules: [{ required: true, message: 'Please input a name' }]
              })(
                <Input
                  autoFocus
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
          <div style={{ marginTop: '20px' }}>
            <FormItem>
              {getFieldDecorator('version', {
                rules: [{ required: true, message: 'Please select a version' }]
              })(
                <Cascader
                  options={this.state.versions}
                  size="large"
                  showSearch={{ filter: this.filter }}
                  onChange={value => this.setState({
                    selectedVersion: value
                  })}
                  style={{ width: 335, display: 'inline-block' }}
                  placeholder="Select a version"
                />
              )}
            </FormItem>
          </div>
          <div className={styles.createInstance}>
            <Button icon="plus" size="large" type="primary" loading={this.state.loading} htmlType="submit">
              Create Server
            </Button>
          </div>
        </Form>

      </Modal>
    );
  }
}



function mapStateToProps(state) {
  return {
    versionsManifest: state.packCreator.versionsManifest,
    forgeManifest: state.packCreator.forgeManifest,
    modalState: state.packCreator.modalState,
  };
}

function mapDispatchToProps(dispatch) {
  return {

  };
}

const form = Form.create()(ServerCreatorModal);


export default connect(mapStateToProps, mapDispatchToProps)(form);
