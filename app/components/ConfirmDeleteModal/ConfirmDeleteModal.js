import React, { useState, useEffect } from 'react';
import { message, Button } from 'antd';
import path from 'path';
import log from 'electron-log';
import { Link } from 'react-router-dom';
import { go } from 'connected-react-router';
import fs from 'fs';
import fsa from 'fs-extra';
import { promisify } from 'util';
import styles from './ConfirmDeleteModal.scss';
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
      title={`Confirm ${type === 'instance' ? 'Instance' : 'Server'} Deletion`}
      style={{ height: 210, width: 400 }}
    >
      <div className={styles.main}>
        Are you sure you want to delete the following? <br />
        <div className={styles.instanceName}>{props.match.params.name}</div>
        This cannot be undone and you will lose everything you've done
      </div>
      <div className={styles.buttons}>
        <Button
          type="primary"
          disabled={deleting}
          onClick={() => setUnMount(true)}
        >
          No, Abort
        </Button>
        <span onClick={() => deleteType()}>Yes, Delete</span>
      </div>
    </Modal>
  );
};
