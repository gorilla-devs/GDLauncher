import React, { useState, useEffect } from 'react';
import { message, Form, Input, Icon, Button, Cascader } from 'antd';
import path from 'path';
import { promisify } from 'util';
import fs from 'fs';
import vSort from 'version-sort';
import axios from 'axios';
import _ from 'lodash';
import { PACKS_PATH, CURSEMETA_API_URL } from '../../constants';
import styles from './CurseModpackBrowserCreatorModal.scss';
import Modal from '../Common/Modal/Modal';

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

  useEffect(async () => {
    const { data } = await axios.get(`${CURSEMETA_API_URL}/direct/addon/${addonID}`);
    setVersions(data.latestFiles);
    setLoading(false);
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    form.validateFields(async (err, values) => {
      if (!err) {
        console.log(values);
        // try {
        //   await promisify(fs.access)(path.join(PACKS_PATH, values.packName));
        //   message.warning('An instance with this name already exists.');
        // } catch (error) {
        //   if (values.version[0] === 'vanilla') {
        //     props.createPack(values.version[2], values.packName);
        //   } else if (values.version[0] === 'forge') {
        //     props.createPack(
        //       values.version[1],
        //       values.packName,
        //       values.version[2]
        //     );
        //   }
        //   this.setState({ unMount: true });
        // }
      }
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Modal
      history={props.history}
      unMount={unMount}
      title="Create New Instance"
      style={{ height: '80vh' }}
    >
      <Form
        layout="inline"
        className={styles.container}
        onSubmit={handleSubmit}
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
                options={versions}
                size="large"
                onChange={value => console.log(value)}
                style={{ width: 335, display: 'inline-block' }}
                placeholder="Select a version"
              />
            )}
          </FormItem>
        </div>
        <div className={styles.createInstance}>
          <Button icon="plus" size="large" type="primary" htmlType="submit">
            Create Instance
            </Button>
        </div>
      </Form>
    </Modal>
  );
}

export default Form.create()(CurseModpackBrowserCreatorModal);
