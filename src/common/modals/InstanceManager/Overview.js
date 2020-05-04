import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import fss from 'fs-extra';

import path from 'path';

import omit from 'lodash/omit';
import { useDebouncedCallback } from 'use-debounce';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faUndo } from '@fortawesome/free-solid-svg-icons';
import { Input, Button, Switch, Slider, Select } from 'antd';
import { ipcRenderer } from 'electron';
import { _getInstancesPath, _getInstance } from '../../utils/selectors';
import {
  DEFAULT_JAVA_ARGS,
  resolutionPresets
} from '../../../app/desktop/utils/constants';
import { updateInstanceConfig } from '../../reducers/actions';
import { convertMinutesToHumanTime } from '../../utils';

const Container = styled.div`
  padding: 0 50px;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
`;

const Column = styled.div``;

const RenameRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  color: ${props => props.theme.palette.text.primary};
  margin: 30px 0 30px 0;
  width: 100%;
`;

const RenameButton = styled(Button)`
  margin-left: 20px;
`;

const CardBox = styled.div`
  flex: 1;
  height: 60px;
  font-weight: 500;
  border-radius: ${props => props.theme.shape.borderRadius};
  color: ${props => props.theme.palette.text.primary};
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-size: 20px;
  position: relative;
  padding: 0 10px;
`;

const OverviewCard = styled.div`
  margin-bottom: 30px;
  padding: 0;
  ${CardBox} {
    margin: 0 20px;
  }
  ${CardBox}:first-child {
    margin-right: 20px;
    margin-left: 0;
  }
  ${CardBox}:last-child {
    margin-left: 20px;
    margin-right: 0;
  }
`;

const JavaManagerRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  color: ${props => props.theme.palette.text.primary};
  margin: 0 500px 30px 0;
  width: 100%;
`;

const JavaMemorySlider = styled(Slider)`
  margin: 30px 0 55px 0;
`;

const JavaArgumentsResetButton = styled(Button)`
  margin-left: 20px;
`;

const ResolutionInputContainer = styled.div`
  margin: 10px 0 30px 0;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  div {
    width: 200px;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
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
  const [screenResolution, setScreenResolution] = useState(null);
  const [height, setHeight] = useState(config?.resolution?.height);
  const [width, setWidth] = useState(config?.resolution?.width);

  const dispatch = useDispatch();

  useEffect(() => {
    ipcRenderer
      .invoke('getAllDisplaysBounds')
      .then(setScreenResolution)
      .catch(console.error);
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

  const updateGameResolution = (w, h) => {
    dispatch(
      updateInstanceConfig(instanceName, prev => ({
        ...prev,
        resolution: { height: h, width: w }
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

  const computeLastPlayed = timestamp => {
    const lastPlayed = new Date(timestamp);
    const timeDiff = lastPlayed.getTime() - new Date(Date.now()).getTime();
    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    switch (diffDays) {
      case 0:
        return 'Today';
      case -1:
        return 'Yesterday';
      default:
        return lastPlayed.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric'
        });
    }
  };

  return (
    <Container>
      <Column>
        <OverviewCard
          css={`
            display: flex;
            justify-content: space-between;
            width: 100%;
            margin-top: 20px;
          `}
        >
          <CardBox
            css={`
              background: ${props => props.theme.palette.colors.crimson};
            `}
          >
            <div
              css={`
                position: absolute;
                top: 5px;
                left: 10px;
                font-size: 10px;
                color: ${props => props.theme.palette.text.third};
              `}
            >
              Minecraft Version
            </div>
            <div>{config?.modloader[1]}</div>
          </CardBox>
          <CardBox
            css={`
              background: ${props => props.theme.palette.colors.liberty};
            `}
          >
            <div
              css={`
                position: absolute;
                top: 5px;
                left: 10px;
                font-size: 10px;
                color: ${props => props.theme.palette.text.third};
              `}
            >
              Modloader
            </div>
            <div>{config?.modloader[0]}</div>
          </CardBox>
          <CardBox
            css={`
              background: ${props => props.theme.palette.colors.darkBlue};
            `}
          >
            <div
              css={`
                position: absolute;
                top: 5px;
                left: 10px;
                font-size: 10px;
                color: ${props => props.theme.palette.text.third};
              `}
            >
              Modloader Version
            </div>
            <div>{config?.modloader[2] || '-'}</div>
          </CardBox>
        </OverviewCard>
        <OverviewCard
          css={`
            display: flex;
            justify-content: space-between;
            width: 100%;
            margin-bottom: 60px;
          `}
        >
          <CardBox
            css={`
              background: ${props => props.theme.palette.colors.ruby};
            `}
          >
            <div
              css={`
                position: absolute;
                top: 5px;
                left: 10px;
                font-size: 10px;
                color: ${props => props.theme.palette.text.third};
              `}
            >
              Mods
            </div>
            <div>{config?.mods?.length || '-'}</div>
          </CardBox>
          <CardBox
            css={`
              background: ${props => props.theme.palette.colors.darkYellow};
            `}
          >
            <div
              css={`
                position: absolute;
                top: 5px;
                left: 10px;
                font-size: 10px;
                color: ${props => props.theme.palette.text.third};
              `}
            >
              Played Time
            </div>
            <div>{convertMinutesToHumanTime(config?.timePlayed)}</div>
          </CardBox>
          <CardBox
            css={`
              background: ${props => props.theme.palette.colors.orange};
            `}
          >
            <div
              css={`
                position: absolute;
                top: 5px;
                left: 10px;
                font-size: 10px;
                color: ${props => props.theme.palette.text.third};
              `}
            >
              Last Played
            </div>
            <div>
              {config?.lastPlayed ? computeLastPlayed(config?.lastPlayed) : '-'}
            </div>
          </CardBox>
        </OverviewCard>
        <RenameRow>
          <Input value={newName} onChange={e => setNewName(e.target.value)} />
          <RenameButton onClick={() => renameInstance()} type="primary">
            Rename&nbsp;
            <FontAwesomeIcon icon={faSave} />
          </RenameButton>
        </RenameRow>
        <OverviewCard>
          <JavaManagerRow>
            <div>Override Game Resolution</div>
            <Switch
              checked={height && width}
              onChange={v => {
                if (!v) {
                  setHeight(null);
                  setWidth(null);
                  dispatch(
                    updateInstanceConfig(instanceName, prev =>
                      omit(prev, ['resolution'])
                    )
                  );
                } else {
                  updateGameResolution(800, 600);
                  setHeight(600);
                  setWidth(800);
                }
              }}
            />
          </JavaManagerRow>
          {height && width && (
            <ResolutionInputContainer>
              <div>
                <Input
                  placeholder="Width"
                  value={width}
                  onChange={e => {
                    const w = parseInt(e.target.value, 10) || 800;
                    setWidth(w);
                    dispatch(
                      updateInstanceConfig(instanceName, prev => ({
                        ...prev,
                        resolution: {
                          height,
                          width: w
                        }
                      }))
                    );
                  }}
                />
                &nbsp;X&nbsp;
                <Input
                  placeholder="Height"
                  value={height}
                  onChange={e => {
                    const h = parseInt(e.target.value, 10) || 600;
                    setHeight(h);
                    dispatch(
                      updateInstanceConfig(instanceName, prev => ({
                        ...prev,
                        resolution: {
                          height: h,
                          width
                        }
                      }))
                    );
                  }}
                />
              </div>
              <Select
                placeholder="Presets"
                onChange={v => {
                  const w = parseInt(v.split('x')[0], 10);
                  const h = parseInt(v.split('x')[1], 10);
                  setHeight(h);
                  setWidth(w);
                  dispatch(
                    updateInstanceConfig(instanceName, prev => ({
                      ...prev,
                      resolution: {
                        height: h,
                        width: w
                      }
                    }))
                  );
                }}
              >
                {resolutionPresets.map(v => {
                  const w = parseInt(v.split('x')[0], 10);
                  const h = parseInt(v.split('x')[1], 10);

                  const isBiggerThanScreen = (screenResolution || []).every(
                    bounds => {
                      return bounds.width < w || bounds.height < h;
                    }
                  );
                  if (isBiggerThanScreen) return null;
                  return <Select.Option value={v}>{v}</Select.Option>;
                })}
              </Select>
            </ResolutionInputContainer>
          )}
          <JavaManagerRow>
            <div>Override Java Memory</div>
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
            <div>Override Java Arguments</div>
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
        </OverviewCard>
      </Column>
    </Container>
  );
};

export default Overview;
