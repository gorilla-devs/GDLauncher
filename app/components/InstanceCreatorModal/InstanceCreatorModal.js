// @flow
import React, { useState } from 'react';
import { message, Form, Input, Icon, Button, Cascader } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import path from 'path';
import { promises as fs } from 'fs';
import vSort from 'version-sort';
import _ from 'lodash';
import { PACKS_PATH } from '../../constants';
import styles from './InstanceCreatorModal.scss';
import Modal from '../Common/Modal/Modal';
import { createInstance } from '../../reducers/actions';

type Props = {};
const FormItem = Form.Item;

function InstanceCreatorModal(props) {
  const [unMount, setUnmount] = useState(false);
  const dispatch = useDispatch();
  const vanillaManifest = useSelector(state => state.app.vanillaManifest);
  const forgeManifest = useSelector(state => state.app.forgeManifest);

  const versions = [
    {
      value: 'vanilla',
      label: 'Vanilla',
      children: [
        {
          value: 'releases',
          label: 'Releases',
          children: vanillaManifest
            .filter(v => v.type === 'release')
            .map(v => ({
              value: v.id,
              label: v.id
            }))
        },
        {
          value: 'snapshots',
          label: 'Snapshots',
          children: vanillaManifest
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
      children: Object.keys(forgeManifest).map(v => ({
        value: v,
        label: v,
        // same as above
        children: _.reverse(vSort(forgeManifest[v]).slice()).map(ver => ({
          value: ver,
          label: ver
        }))
      }))
    }
  ];

  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields(async (err, values) => {
      if (!err) {
        try {
          await fs.access(path.join(PACKS_PATH, values.packName));
          message.warning('An instance with this name already exists.');
        } catch (error) {
          if (values.version[0] === 'vanilla') {
            await dispatch(createInstance(values.version[2], values.packName));
          } else if (values.version[0] === 'forge') {
            await dispatch(createInstance(
              values.version[1],
              values.packName,
              values.version[2]
            ));
          }
          setUnmount(false);
        }
      }
    });
  };

  filter = (inputValue, pathy) => pathy[2].label.indexOf(inputValue) > -1;

  render() {
    const { getFieldDecorator } = props.form;

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
                    required: true,
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
                  showSearch={{ filter: filter }}
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
}

export default Form.create()(InstanceCreatorModal);
