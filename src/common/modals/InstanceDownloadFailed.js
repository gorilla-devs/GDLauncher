import React, { useState } from 'react';
import { Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { remove } from 'fs-extra';
import path from 'path';
import Modal from '../components/Modal';
import {
  addNextInstanceToCurrentDownload,
  downloadInstance,
  removeDownloadFromQueue
} from '../reducers/actions';
import { closeModal } from '../reducers/modals/actions';
import { _getInstancesPath } from '../utils/selectors';

const InstanceDownloadFailed = ({ instanceName, error }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const instancesPath = useSelector(_getInstancesPath);

  const ellipsedName =
    instanceName.length > 20
      ? `${instanceName.substring(0, 20)}...`
      : instanceName;

  const cancelDownload = async () => {
    await dispatch(removeDownloadFromQueue(instanceName));
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await remove(path.join(instancesPath, instanceName));
    setLoading(false);
    dispatch(addNextInstanceToCurrentDownload());
    dispatch(closeModal());
  };

  const retry = async () => {
    // Reset current download state
    dispatch(closeModal());
    dispatch(downloadInstance(instanceName));
  };

  return (
    <Modal
      css={`
        width: 50%;
        max-width: 550px;
        overflow-x: hidden;
      `}
      title={`Instance Download Failed - ${ellipsedName}`}
    >
      <div>
        The download for {instanceName} failed.
        <div
          css={`
            background: ${props => props.theme.palette.grey[900]};
            padding: 10px;
            margin: 10px 0;
          `}
        >
          {'> '}
          {error.toString()}
        </div>
        <div>What do you want to do?</div>
        <div
          css={`
            margin-top: 50px;
            display: flex;
            width: 100%;
            justify-content: space-between;
          `}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={cancelDownload}
            loading={loading}
          >
            Cancel Download
          </Button>
          <Button danger type="primary" onClick={retry} disabled={loading}>
            Retry Download
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default InstanceDownloadFailed;
