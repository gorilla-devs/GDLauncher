import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { message, Form, Input, Icon, Button, Select } from 'antd';
import axios from 'axios';
import _ from 'lodash';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { CURSEMETA_API_URL, PACKS_PATH } from '../../constants';
import styles from './CurseModpackBrowserCreatorModal.scss';
import Modal from '../Common/Modal/Modal';
import { addCursePackToQueue } from '../../actions/downloadManager';

type Props = {
  forgeManifest: Array,
  versionsManifest: Array
};
const FormItem = Form.Item;

const CurseModpackBrowserCreatorModal = props => {
  const { forgeManifest, versionsManifest, match, form } = props;
  const { getFieldDecorator } = form;
  const { addonID } = match.params;
  const [versions, setVersions] = useState([]);
  const [unMount, setUnMount] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [instanceName, setInstanceName] = useState('');

  const getModPackData = async () => {
    const { data } = await axios.get(
      `${CURSEMETA_API_URL}/direct/addon/${addonID}/files`
    );
    const instanceNameVar = (await axios.get(
      `${CURSEMETA_API_URL}/direct/addon/${addonID}`
    )).data.name;
    setInstanceName(instanceNameVar);
    setVersions(data);
    setLoading(false);
  };

  useEffect(() => {
    getModPackData();
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    form.validateFields(async (err, values) => {
      if (!err) {
        const name =
          values.packName !== undefined
            ? values.packName
            : instanceName.replace(/\W/g, '');
        try {
          await promisify(fs.access)(path.join(PACKS_PATH, name));
          message.warning('An instance with this name already exists.');
        } catch (error) {
          setLoadingBtn(true);
          await props.addCursePackToQueue(name, addonID, values.version);
          setUnMount(true);
          setTimeout(() => {
            props.history.push('/dmanager');
          }, 210);
        }
      }
    });
  };

  return (
    <Modal
      history={props.history}
      unMount={unMount}
      title="Create New Instance"
      style={{ height: 330, width: 540 }}
    >
      <Form
        layout="inline"
        className={styles.container}
        onSubmit={handleSubmit}
      >
        <div>
          <FormItem style={{ margin: 0 }}>
            {getFieldDecorator('packName', {
              rules: [
                {
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
                  height: '60px'
                }}
                prefix={
                  <Icon
                    type="play-circle"
                    theme="filled"
                    style={{ color: 'rgba(255,255,255,.8)' }}
                  />
                }
                placeholder={
                  instanceName !== ''
                    ? instanceName.replace(/\W/g, '')
                    : 'Loading...'
                }
              />
            )}
          </FormItem>
        </div>
        <div style={{ marginTop: '20px' }}>
          <FormItem>
            {getFieldDecorator('version', {
              rules: [{ required: true, message: 'Please select a version' }]
            })(
              <Select
                size="large"
                style={{ width: 335, display: 'inline-block' }}
                placeholder="Select a version"
                loading={loading}
              >
                {_.reverse(
                  versions
                    .map(addon => (
                      <Select.Option key={addon.id}>
                        {addon.fileName.replace('.zip', '')}
                      </Select.Option>
                    ))
                    .slice()
                )}
              </Select>
            )}
          </FormItem>
        </div>
        <div className={styles.createInstance}>
          <Button
            icon="plus"
            size="large"
            type="primary"
            htmlType="submit"
            loading={loadingBtn}
          >
            Create Instance
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

const mapDispatchToProps = {
  addCursePackToQueue
};

export default connect(
  null,
  mapDispatchToProps
)(Form.create()(CurseModpackBrowserCreatorModal));
