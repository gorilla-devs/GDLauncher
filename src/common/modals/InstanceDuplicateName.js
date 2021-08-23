import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useState } from 'react';
import { Button, Input } from 'antd';
import fse from 'fs-extra';
import path from 'path';
import { transparentize } from 'polished';
import { useInterval } from 'rooks';
import makeDir from 'make-dir';
import Modal from '../components/Modal';
import { closeModal } from '../reducers/modals/actions';
import { _getInstance, _getInstancesPath } from '../utils/selectors';
import { updateInstanceConfig } from '../reducers/actions';

const InstanceDuplicateName = ({ instanceName }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const oldInstanceName = instanceName;
  const instancesPath = useSelector(_getInstancesPath);
  const oldInstance = useSelector(state => _getInstance(state)(instanceName));
  const [newInstanceName, setNewInstanceName] = useState(
    `${oldInstanceName} copy`
  );
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [invalidName, setInvalidName] = useState(false);

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

    // Copy the old instance to the new instance folder
    await fse.copy(
      path.join(instancesPath, oldInstanceName),
      path.join(instancesPath, newInstanceName)
    );

    // Reset the time played back to 0
    dispatch(
      updateInstanceConfig(newInstanceName, () => ({
        ...oldInstance,
        name: newInstanceName,
        timePlayed: 0,
        lastPlayed: 0
      }))
    );

    setLoading(false);
  };
  return (
    <Modal
      css={`
        height: 230px;
        width: 550px;
        max-width: 550px;
        max-height: 235px;
        overflow-x: hidden;
      `}
      title={`Duplicate Instance "${oldInstanceName}"`}
    >
      <div
        css={`
          display: flex;
          flex-direction: column;
          justify-content: center;
        `}
      >
        <p>
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
          display: flex;
          width: 100%;
          justify-content: flex-end;
        `}
      >
        <Button
          onClick={duplicateInstance}
          loading={loading}
          disabled={invalidName || alreadyExists}
          type="primary"
        >
          Duplicate Instance
        </Button>
      </div>
    </Modal>
  );
};

export default InstanceDuplicateName;
