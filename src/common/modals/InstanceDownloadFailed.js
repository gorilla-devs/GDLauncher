import React, { useState } from 'react';
import { Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { copy, remove, readJson } from 'fs-extra';
import path from 'path';
import lockfile from 'lockfile';
import { readdir, unlink } from 'fs/promises';
import Modal from '../components/Modal';
import {
  addNextInstanceToCurrentDownload,
  downloadInstance,
  removeDownloadFromQueue,
  updateInstanceConfig
} from '../reducers/actions';
import { closeModal } from '../reducers/modals/actions';
import { _getInstancesPath, _getTempPath } from '../utils/selectors';

const InstanceDownloadFailed = ({ instanceName, error, isUpdate }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const instancesPath = useSelector(_getInstancesPath);
  const tempPath = useSelector(_getTempPath);

  const ellipsedName =
    instanceName.length > 20
      ? `${instanceName.substring(0, 20)}...`
      : instanceName;

  const cancelDownload = async () => {
    await dispatch(removeDownloadFromQueue(instanceName, true));
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const instancePath = path.join(instancesPath, instanceName);

    if (isUpdate) {
      await new Promise(resolve => {
        lockfile.lock(path.join(instancePath, 'installing.lock'), err => {
          if (err) console.error(err);
          resolve();
        });
      });

      const contentDir = await readdir(instancePath);

      await Promise.all(
        contentDir.map(async f => {
          try {
            if (f !== 'config.json' && f !== 'installing.lock') {
              const filePath = path.join(instancesPath, instanceName, f);
              await unlink(filePath);
            }
          } catch (err) {
            console.error(err);
          }
          return null;
        })
      );

      const oldInstanceContentDir = await readdir(
        path.join(tempPath, instanceName)
      );

      await Promise.all(
        oldInstanceContentDir.map(async f => {
          try {
            if (f !== 'installing.lock') {
              const tempFilePath = path.join(tempPath, instanceName, f);
              const newFilePath = path.join(instancesPath, instanceName, f);

              await copy(tempFilePath, newFilePath, {
                overwrite: true,
                recursive: true
              });
            }
          } catch (err) {
            console.error(err);
          }
          return null;
        })
      );

      const currentConfig = await readJson(
        path.join(instancePath, 'config.json')
      );

      dispatch(updateInstanceConfig(instanceName, () => currentConfig));

      await new Promise(resolve => setTimeout(resolve, 2000));

      await new Promise(resolve => {
        lockfile.unlock(path.join(instancePath, 'installing.lock'), err => {
          if (err) console.error(err);
          resolve();
        });
      });
    }

    if (!isUpdate) await remove(instancePath);
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
