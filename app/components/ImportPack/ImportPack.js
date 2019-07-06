import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { remote } from 'electron';
import { message, Form, Input, Icon, Button, Select } from 'antd';
import axios from 'axios';
import _ from 'lodash';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { PACKS_PATH } from '../../constants';
import styles from './ImportPack.scss';
import Modal from '../Common/Modal/Modal';
import { importTwitchProfile } from '../../actions/downloadManager';

type Props = {
  forgeManifest: Array,
  versionsManifest: Array
};
const FormItem = Form.Item;

const ImportPack = props => {
  const { form } = props;
  const { getFieldDecorator } = form;
  const [unMount, setUnMount] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filePath, setFilePath] = useState(null);
  const [packType, setPackType] = useState('Twitch');

  const handleSubmit = e => {
    e.preventDefault();
    form.validateFields(async (err, values) => {
      if (!err) {
        if (!filePath) {
          message.warning('Please select a zip file.');
          return;
        }
        const name = values.packName || path.parse(path.basename(filePath)).name;

        try {
          await promisify(fs.access)(path.join(PACKS_PATH, name));
          message.warning('An instance with this name already exists.');
        } catch (error) {
          setLoading(true);
          await props.importTwitchProfile(name, filePath);
          setUnMount(true);
        }
      }
    });
  };

  const showFileDialog = () => {
    remote.dialog.showOpenDialog(
      {
        filters: [{ name: 'Twitch Zip', extensions: ['zip'] }],
        properties: ['openFile']
      },
      paths => {
        setFilePath(paths[0]);
      }
    );
  };

  return (
    <Modal
      history={props.history}
      unMount={unMount}
      title="Import Pack"
      style={{ height: 330, width: 540 }}
    >
      <Form
        layout="inline"
        className={styles.container}
        onSubmit={handleSubmit}
      >
        <div>
          <FormItem style={{ margin: 0, width: 450 }}>
            {getFieldDecorator('packName', {
              rules: [
                {
                  required: false,
                  message:
                    'Please input a valid name with just numbers and letters',
                  pattern: new RegExp('^[a-zA-Z0-9_.-]+( [a-zA-Z0-9_.-]+)*$')
                }
              ]
            })(
              <Input
                autoFocus
                size="large"
                style={{
                  width: 450,
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
                placeholder={
                  filePath
                    ? path.parse(path.basename(filePath)).name
                    : 'Instance Name'
                }
              />
            )}
          </FormItem>
        </div>
        <div
          style={{
            width: 450,
            margin: 20,
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <span style={{ paddingLeft: 5 }}>
            Zip Type:
            <Select
              style={{ width: 130, marginLeft: 20 }}
              defaultValue="Twitch"
            >
              <Select.Option key="Twitch" value="Twitch">
                Twitch
              </Select.Option>
            </Select>
          </span>
          <Button type="primary" onClick={showFileDialog}>
            {filePath === null
              ? 'Select Zip'
              : path.basename(filePath).length >= 24
              ? `${path.basename(filePath).substr(0, 24)}...`
              : path.basename(filePath)}
          </Button>
        </div>
        <div className={styles.createInstance}>
          <Button
            icon="plus"
            loading={loading}
            size="large"
            type="primary"
            htmlType="submit"
          >
            Import Pack
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

const mapDispatchToProps = {
  importTwitchProfile
};

export default connect(
  null,
  mapDispatchToProps
)(Form.create()(ImportPack));
