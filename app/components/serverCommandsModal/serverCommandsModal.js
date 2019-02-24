import React, { useState, useEffect } from 'react';
import { message, Button } from 'antd';
import path from 'path';
import log from 'electron-log';
import { Link } from 'react-router-dom';
import { go } from 'connected-react-router';
import fs from 'fs';
import fsa from 'fs-extra';
import { promisify } from 'util';
import Modal from '../Common/Modal/Modal';
import { PACKS_PATH, SERVERS_PATH } from '../../constants';

type Props = {};

export default props => {
  const [unMount, setUnMount] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { name, type } = props.match.params;

  const deleteType = async () => {
    if (deleting === true) {
      return;
    }
    try {
      setDeleting(true);
      await fsa.remove(
        path.join(type === 'instance' ? PACKS_PATH : SERVERS_PATH, name)
      );
      message.success(`${type === 'instance' ? 'Instance' : 'Server'} deleted`);
    } catch (err) {
      setDeleting(false);
      message.error(`Error deleting ${name}`);
      log.error(err);
    } finally {
      setUnMount(true);
    }
  };

  return (
    <Modal
      history={props.history}
      unMount={unMount}
      title={`Users`}
      style={{ height: 210, width: 400 }}
    >
      <div></div>
    </Modal>
  );
};
