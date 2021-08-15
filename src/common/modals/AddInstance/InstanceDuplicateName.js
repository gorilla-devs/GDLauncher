import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useState } from 'react';
import { Button, Input } from 'antd';
import fse from 'fs-extra';
import path from 'path';
import { transparentize } from 'polished';
import { useInterval } from 'rooks';
import makeDir from 'make-dir';
import { omit } from 'lodash';
import Modal from '../../components/Modal';
import { closeModal } from '../../reducers/modals/actions';
import { _getInstancesPath } from '../../utils/selectors';
import { updateInstanceConfig } from '../../reducers/actions';

const InstanceDuplicateName = ({ instanceName }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const oldInstanceName = instanceName;
  const instancesPath = useSelector(_getInstancesPath);
  const [newInstanceName, setNewInstanceName] = useState(
    `${oldInstanceName} copy`
  );
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [invalidName, setInvalidName] = useState(true);

  useEffect(() => {
    if (newInstanceName) {
      const regex = /^[\sa-zA-Z0-9_.-]+$/;
      const finalWhiteSpace = /[^\s]$/;
      if (
        !regex.test(newInstanceName) ||
        !finalWhiteSpace.test(newInstanceName) ||
        newInstanceName.length >= 45
      ) {
        setInvalidName(true);
        setAlreadyExists(false);
        return;
      }
      fse
        .pathExists(path.join(instancesPath, newInstanceName))
        .then(exists => {
          setAlreadyExists(exists);
          setInvalidName(false);
          return exists;
        })
        .catch(err => {
          console.error(err);
        });
    }
  }, [newInstanceName]);

  const { start, stop } = useInterval(() => {
    if (!loading) {
      stop();
      dispatch(closeModal());
    }
  }, 200);

  const duplicateInstance = async () => {
    setLoading(true);
    start();
    await makeDir(path.join(instancesPath, newInstanceName));

    // Copy the old config file, so the launcher can detect the instance
    await fse.copy(
      path.join(instancesPath, oldInstanceName, 'config.json'),
      path.join(instancesPath, newInstanceName, 'config.json')
    );

    // Copy the old instance to the new instance folder
    await fse.copy(
      path.join(instancesPath, oldInstanceName),
      path.join(instancesPath, newInstanceName)
    );

    // Remove curseforge manifest if one exists
    await fse.unlink(
      path.join(instancesPath, newInstanceName, 'manifest.json'),
      err => {
        if (err && err.code !== 'ENOENT') {
          console.error(err);
        }
      }
    );

    // Reset the time played back to 0
    dispatch(
      updateInstanceConfig(newInstanceName, prev => ({
        ...omit(prev, path.join('loaderType', 'source')),
        timePlayed: 0,
        lastPlayed: 0
      }))
    );

    setLoading(false);
  };
  const closeModalWindow = () => !loading && dispatch(closeModal());
  return (
    <Modal
      css={`
        height: 36%;
        width: 50%;
        max-width: 550px;
        max-height: 235px;
        overflow-x: hidden;
      `}
      title="Enter Name For New Instance"
    >
      <div
        css={`
          display: flex;
          flex-direction: column;
          justify-content: center;
        `}
      >
        <p
          css={`
            text-align: center;
          `}
        >
          Please enter a new name for your copy of <b>{oldInstanceName}</b>
        </p>
        <Input
          size="large"
          placeholder={newInstanceName}
          onChange={e => setNewInstanceName(e.target.value)}
          readOnly={loading}
          css={`
            opacity: ${({ state }) =>
              state === 'entering' || state === 'entered' ? 0 : 1};
            transition: 0.1s ease-in-out;
            width: 300px;
            align-self: center;
          `}
        />
        <div
          show={invalidName || alreadyExists}
          css={`
            opacity: ${props => (props.show ? 1 : 0)};
            color: ${props => props.theme.palette.error.main};
            font-weight: 700;
            font-size: 12px;
            padding: 3px;
            height: 30px;
            margin-top: 10px;
            text-align: center;
            border-radius: ${props => props.theme.shape.borderRadius};
            background: ${props =>
              transparentize(0.7, props.theme.palette.grey[700])};
          `}
        >
          {invalidName &&
            'Instance name is not valid or too long. Please try another one'}
          {alreadyExists && 'An instance with this name already exists!'}
        </div>
      </div>
      <div
        css={`
          margin-top: 10px;
          display: flex;
          width: 100%;
          justify-content: space-between;
        `}
      >
        <a
          css={`
            margin-top: 7px;
            color: #54636d;
          `}
          disabled={loading}
          onClick={closeModalWindow}
        >
          Cancel
        </a>
        <Button
          onClick={duplicateInstance}
          loading={loading}
          disabled={invalidName || alreadyExists}
        >
          Copy
        </Button>
      </div>
    </Modal>
  );
};

export default InstanceDuplicateName;
