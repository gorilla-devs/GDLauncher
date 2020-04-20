/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import fss from 'fs-extra';
import { createReadStream, promises as fs } from 'fs';
import path from 'path';
import { ipcRenderer } from 'electron';
import omit from 'lodash/omit';
import { useDebouncedCallback } from 'use-debounce';
import base64 from 'base64-stream';
import getStream from 'get-stream';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSave,
  faUndo,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import { Input, Button, Card, Switch, Slider } from 'antd';
import { _getInstancesPath, _getInstance } from '../../utils/selectors';
import { DEFAULT_JAVA_ARGS } from '../../../app/desktop/utils/constants';

import { updateInstanceConfig } from '../../reducers/actions';
const Container = styled.div`
  margin-left: 50px;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
`;

const Column = styled.div`
  max-width: 600px;
`;

const Overlay = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: ${props => props.theme.palette.grey[700]};
  opacity: 0;
`;

const InstanceBackground = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: ${props =>
    props.imagePath
      ? `url(${props.imagePath}) center no-repeat`
      : props.theme.palette.primary.dark};

  transition: opacity 0.2s ease;
  &&:hover svg {
    opacity: 1;
    z-index: 2;
  }

  &&:hover p {
    opacity: 1;
    z-index: 2;
  }

  &&:hover ${Overlay} {
    opacity: 0.3;
  }

  svg {
    margin-top: 10px;
    color: ${props => props.theme.palette.colors.red};
    opacity: 0;
  }

  p {
    width: 50px;
    text-align: center;
    opacity: 0;
  }
`;
// background: ${props => props.theme.palette.primary.dark};

const MainTitle = styled.h1`
  color: ${props => props.theme.palette.text.primary};
  margin: 0 500px 20px 0;
  margin-bottom: 20px;
`;

const RenameRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  color: ${props => props.theme.palette.text.primary};
  margin: 0 500px 20px 0;
  width: 100%;
`;

const RenameButton = styled(Button)`
  margin-left: 20px;
`;

const JavaManagerCard = styled(Card)`
  margin-bottom: 20px;
  padding: 0;
`;

const JavaManagerRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  color: ${props => props.theme.palette.text.primary};
  margin: 0 500px 20px 0;
  width: 100%;
`;

const JavaMemorySlider = styled(Slider)`
  margin: 30px 0 55px 0;
`;

const JavaArgumentsResetButton = styled(Button)`
  margin-left: 20px;
`;

const marks = {
  2048: '2048 MB',
  4096: '4096 MB',
  8192: '8192 MB',
  16384: '16384 MB'
};

const Overview = ({ instanceName }) => {
  const instancesPath = useSelector(_getInstancesPath);
  const config = useSelector(state => _getInstance(state)(instanceName));
  const [JavaMemorySwitch, setJavaMemorySwitch] = useState(
    config?.javaMemory !== undefined
  );
  const [JavaArgumentsSwitch, setJavaArgumentsSwitch] = useState(
    config?.javaArgs !== undefined
  );
  const [javaLocalMemory, setJavaLocalMemory] = useState(config?.javaMemory);
  const [javaLocalArguments, setJavaLocalArguments] = useState(
    config?.javaArgs
  );
  const [newName, setNewName] = useState(instanceName);
  const [background, setBackground] = useState(config?.background);

  const dispatch = useDispatch();

  // const setBg = async () => {
  //   if (config?.background) {
  //     setBackground(path.join(instancesPath, instanceName, config?.background));
  //   }
  // };

  useEffect(() => {
    // const instancePath = path.join(instancesPath, instanceName);
    // const fileName = path.basename(dialog.filePaths[0]);
    // const ext = path.basename(
    //   dialog.filePaths[0].substr(dialog.filePaths[0].lastIndexOf('.') + 1)
    // );
    // const filePath = path.join(instancePath, `icon.${ext}`);
    if (config?.background) {
      fs.readFile(path.join(instancesPath, instanceName, config?.background))
        .then(res => {
          console.log('res', res);
          setBackground(`data:image/png;base64,${res.toString('base64')}`);
        })
        .catch(console.warning);
    }
    // setBg();
    console.log('background', background);
  }, []);

  const updateJavaMemory = v => {
    dispatch(
      updateInstanceConfig(instanceName, prev => ({
        ...prev,
        javaMemory: v
      }))
    );
  };

  const updateJavaArguments = v => {
    dispatch(
      updateInstanceConfig(instanceName, prev => ({
        ...prev,
        javaArgs: v
      }))
    );
  };

  const updateBackGround = v => {
    dispatch(
      updateInstanceConfig(instanceName, prev => ({
        ...prev,
        background: v
      }))
    );
  };

  const [debouncedArgumentsUpdate] = useDebouncedCallback(
    v => {
      updateJavaArguments(v);
    },
    400,
    { maxWait: 700, leading: false }
  );

  const resetJavaArguments = () => {
    setJavaLocalArguments(DEFAULT_JAVA_ARGS);
    updateJavaArguments(DEFAULT_JAVA_ARGS);
  };

  const renameInstance = () => {
    fss.rename(
      path.join(instancesPath, instanceName),
      path.join(instancesPath, newName)
    );
  };

  const openFileDialog = async () => {
    const dialog = await ipcRenderer.invoke('openFileDialog', [
      { name: 'Image', extensions: ['png', 'jpg', 'jpeg'] }
    ]);
    if (dialog.canceled) return;
    const instancePath = path.join(instancesPath, instanceName);
    const fileName = path.basename(dialog.filePaths[0]);
    const ext = path.basename(
      dialog.filePaths[0].substr(dialog.filePaths[0].lastIndexOf('.') + 1)
    );
    const filePath = path.join(instancePath, `icon.${ext}`);
    await fss.copy(dialog.filePaths[0], filePath);

    // const imageReadStream = createReadStream(dialog.filePaths[0]);
    // const encodedData = new base64.Base64Encode();
    // const b64s = imageReadStream.pipe(encodedData);
    // const base64String = await getStream(b64s);
    // updateBackGround(`icon.${ext}`);

    // if (instance.background) {
    //   fs.readFile(path.join(instancesPath, instanceName, instance.background))
    //     .then(res =>
    //       setBackground(`data:image/png;base64,${res.toString('base64')}`)
    //     )
    //     .catch(console.warning);
    // } else {

    fs.readFile(filePath)
      .then(res => {
        console.log('res', res);
        setBackground(`data:image/png;base64,${res.toString('base64')}`);
      })
      .catch(console.warning);
    setBackground(filePath);
    updateBackGround(`icon.${ext}`);
  };

  return (
    <Container>
      <Column>
        <InstanceBackground
          onClick={openFileDialog}
          imagePath={background}
          // src={background}
          // key={background}
          // alt={background}
        >
          <Overlay />
          <p>Change icon</p>
          <FontAwesomeIcon
            icon={faTimesCircle}
            onClick={e => {
              e.stopPropagation();
              updateBackGround('');
              setBackground('');
            }}
          />
        </InstanceBackground>
        <MainTitle>Overview</MainTitle>
        <RenameRow>
          <Input value={newName} onChange={e => setNewName(e.target.value)} />
          <RenameButton onClick={() => renameInstance()} type="primary">
            Rename&nbsp;
            <FontAwesomeIcon icon={faSave} />
          </RenameButton>
        </RenameRow>
        <JavaManagerCard title="Override Java Settings">
          <JavaManagerRow>
            <div>Java Memory</div>
            <Switch
              checked={JavaMemorySwitch}
              onChange={v => {
                setJavaMemorySwitch(v);

                if (!v) {
                  dispatch(
                    updateInstanceConfig(instanceName, prev =>
                      omit(prev, ['javaMemory'])
                    )
                  );
                } else if (v) {
                  setJavaLocalMemory(4096);
                  updateJavaMemory(4096);
                }
              }}
            />
          </JavaManagerRow>
          {JavaMemorySwitch && (
            <div>
              <JavaMemorySlider
                onAfterChange={updateJavaMemory}
                onChange={setJavaLocalMemory}
                value={javaLocalMemory}
                min={1024}
                max={16384}
                step={512}
                marks={marks}
                valueLabelDisplay="auto"
              />
            </div>
          )}
          <JavaManagerRow>
            <div>Java Arguments</div>
            <Switch
              checked={JavaArgumentsSwitch}
              onChange={v => {
                setJavaArgumentsSwitch(v);

                if (!v) {
                  dispatch(
                    updateInstanceConfig(instanceName, prev =>
                      omit(prev, ['javaArgs'])
                    )
                  );
                } else if (v) {
                  resetJavaArguments();
                }
              }}
            />
          </JavaManagerRow>
          {JavaArgumentsSwitch && (
            <JavaManagerRow>
              <Input
                value={javaLocalArguments}
                onChange={e => {
                  setJavaLocalArguments(e.target.value);
                  debouncedArgumentsUpdate(e.target.value);
                }}
              />
              <JavaArgumentsResetButton onClick={resetJavaArguments}>
                <FontAwesomeIcon icon={faUndo} />
              </JavaArgumentsResetButton>
            </JavaManagerRow>
          )}
        </JavaManagerCard>
      </Column>
    </Container>
  );
};

export default Overview;
