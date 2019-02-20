import React, { useState, useEffect } from 'react';
import { message, Button } from 'antd';
import path from 'path';
import log from 'electron-log';
import { Link } from 'react-router-dom';
import { go } from 'connected-react-router';
import fs from 'fs';
import fsa from 'fs-extra';
import { promisify } from 'util';
import styles from './ConfirmDeleteInstanceModal.scss';
import Modal from '../Common/Modal/Modal';
import { PACKS_PATH } from '../../constants';

type Props = {};

export default props => {
  const [unMount, setUnMount] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const deleteInstance = async () => {
    const { instance } = props.match.params;
    try {
      setDeleting(true);
      await fsa.remove(path.join(PACKS_PATH, instance));
      message.success('Instance deleted');
    } catch (err) {
      setDeleting(false);
      message.error('Error deleting instance');
      log.error(err);
    } finally {
      setUnMount(true);
    }
  };

  return (
    <Modal
      history={props.history}
      unMount={unMount}
      title="Confirm Instance Deletion"
      style={{ height: 210, width: 400 }}
    >
      <div className={styles.main}>
        Are you sure you want to delete the following instance? <br />
        <div className={styles.instanceName}>{props.match.params.instance}</div>
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
        <span onClick={deleting === false ? deleteInstance : () => {}}>
          Yes, Delete
        </span>
      </div>
    </Modal>
  );
};
