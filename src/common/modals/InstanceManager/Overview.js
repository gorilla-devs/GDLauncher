import React, { useState, useEffect, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import fss from 'fs-extra';
import path from 'path';
import omit from 'lodash/omit';
import { useDebouncedCallback } from 'use-debounce';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSave,
  faUndo,
  faCog,
  faFolder
} from '@fortawesome/free-solid-svg-icons';
import { Input, Button, Switch, Slider, Select } from 'antd';
import { ipcRenderer } from 'electron';
import {
  _getInstancesPath,
  _getInstance,
  _getJavaPath
} from '../../utils/selectors';
import instanceDefaultBackground from '../../assets/instance_default.png';
import {
  DEFAULT_JAVA_ARGS,
  resolutionPresets
} from '../../../app/desktop/utils/constants';
import {
  getJavaVersionForMCVersion,
  updateInstanceConfig
} from '../../reducers/actions';
import { openModal } from '../../reducers/modals/actions';
import {
  convertMinutesToHumanTime,
  marks,
  scaleMem,
  scaleMemInv,
  sysMemScaled
} from '../../utils';
import { CURSEFORGE } from '../../utils/constants';

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
  margin: 60px 0 30px 0;
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
  margin: 0 500px 20px 0;
  width: 100%;
`;

const JavaMemorySlider = styled(Slider)`
  margin: 10px 40px 55px 40px !important;
  flex: 1;
`;

const JavaResetButton = styled(Button)`
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

const Card = memo(
  ({ title, children, color, icon, instanceName, defaultValue }) => {
    const dispatch = useDispatch();
    return (
      <CardBox
        css={`
          background: ${color};
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        `}
      >
        <div
          css={`
            position: absolute;
            top: 5px;
            left: 10px;
            font-size: 10px;
            color: ${props => props.theme.palette.text.secondary};
          `}
        >
          {title}
        </div>

        {icon && (
          <div
            css={`
              position: absolute;
              top: 5px;
              right: 10px;
              font-size: 10px;
              color: ${props => props.theme.palette.text.secondary};
              cursor: pointer;
            `}
            onClick={() => {
              dispatch(
                openModal('McVersionChanger', { instanceName, defaultValue })
              );
            }}
          >
            {icon}
          </div>
        )}

        <div>{children}</div>
      </CardBox>
    );
  }
);

const Overview = ({ instanceName, background, manifest }) => {
  const dispatch = useDispatch();
  const instancesPath = useSelector(_getInstancesPath);
  const config = useSelector(state => _getInstance(state)(instanceName));
  const javaVersion = dispatch(
    getJavaVersionForMCVersion(config?.loader?.mcVersion)
  );
  const defaultJavaPath = useSelector(state =>
    _getJavaPath(state)(javaVersion)
  );
  const [javaLocalMemory, setJavaLocalMemory] = useState(
    scaleMem(config?.javaMemory)
  );
  const [javaLocalArguments, setJavaLocalArguments] = useState(
    config?.javaArgs
  );
  const [customJavaPath, setCustomJavaPath] = useState(config?.customJavaPath);
  const [newName, setNewName] = useState(instanceName);
  const [screenResolution, setScreenResolution] = useState(null);
  const [height, setHeight] = useState(config?.resolution?.height);
  const [width, setWidth] = useState(config?.resolution?.width);

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
        javaMemory: Math.round(scaleMemInv(v))
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

  const updateCustomJavaPath = v => {
    dispatch(
      updateInstanceConfig(instanceName, prev => ({
        ...prev,
        customJavaPath: v
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

  const debouncedArgumentsUpdate = useDebouncedCallback(
    v => {
      updateJavaArguments(v);
    },
    400,
    { maxWait: 700, leading: false }
  );

  const debouncedJavaPathUpdate = useDebouncedCallback(
    v => {
      updateCustomJavaPath(v);
    },
    400,
    { maxWait: 700, leading: false }
  );

  const resetJavaArguments = () => {
    setJavaLocalArguments(DEFAULT_JAVA_ARGS);
    updateJavaArguments(DEFAULT_JAVA_ARGS);
  };

  const resetCustomJavaPath = () => {
    setCustomJavaPath(defaultJavaPath);
    updateCustomJavaPath(defaultJavaPath);
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
          <Card
            title="Minecraft Version"
            color={props => props.theme.palette.colors.jungleGreen}
            instanceName={instanceName}
            defaultValue={config?.loader}
            icon={<FontAwesomeIcon icon={faCog} />}
          >
            {config?.loader?.mcVersion}
          </Card>
          <Card
            title="Modloader"
            color={props => props.theme.palette.colors.darkYellow}
            instanceName={instanceName}
            defaultValue={config?.loader}
            icon={<FontAwesomeIcon icon={faCog} />}
          >
            {config?.loader?.loaderType}
          </Card>
          <Card
            title="Modloader Version"
            color={props => props.theme.palette.colors.lightBlue}
            instanceName={instanceName}
            defaultValue={config?.loader}
            icon={
              (config?.loader?.loaderVersion || '-') !== '-' ? (
                <FontAwesomeIcon icon={faCog} />
              ) : null
            }
          >
            {config?.loader?.loaderType === 'forge'
              ? config?.loader?.loaderVersion?.split('-')[1]
              : config?.loader?.loaderVersion || '-'}
          </Card>
        </OverviewCard>
        <OverviewCard
          css={`
            display: flex;
            justify-content: space-between;
            width: 100%;
            margin-bottom: 30px;
          `}
        >
          <Card
            title="Mods"
            color={props => props.theme.palette.colors.maximumRed}
          >
            {config?.mods?.length || '-'}
          </Card>
          <Card
            title="Played Time"
            color={props => props.theme.palette.colors.liberty}
          >
            {convertMinutesToHumanTime(config?.timePlayed)}
          </Card>
          <Card
            title="Last Played"
            color={props => props.theme.palette.colors.orange}
          >
            {config?.lastPlayed ? computeLastPlayed(config?.lastPlayed) : '-'}
          </Card>
        </OverviewCard>
        {config?.loader.source === CURSEFORGE && manifest && (
          <Card
            title="Curse Modpack"
            color={`linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), ${
              background
                ? `url(${background})`
                : `url(${instanceDefaultBackground})`
            }`}
          >
            {manifest?.name} - {manifest?.version}
          </Card>
        )}
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
                  updateGameResolution(854, 480);
                  setHeight(480);
                  setWidth(854);
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
                    const w = parseInt(e.target.value, 10) || 854;
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
                    const h = parseInt(e.target.value, 10) || 480;
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
                virtual={false}
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
              checked={javaLocalMemory}
              onChange={v => {
                if (!v) {
                  setJavaLocalMemory(null);
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
          {(javaLocalMemory || null) && (
            <div
              css={`
                display: flex;
              `}
            >
              <JavaMemorySlider
                onAfterChange={updateJavaMemory}
                onChange={v => setJavaLocalMemory(Math.round(scaleMemInv(v)))}
                value={scaleMem(javaLocalMemory)}
                min={0}
                max={sysMemScaled}
                step={0.1}
                marks={marks}
                valueLabelDisplay="auto"
              />
              <div
                css={`
                  display: grid;
                  place-items: center;
                  width: 100px;
                `}
              >
                {javaLocalMemory} MB
              </div>
            </div>
          )}
          <JavaManagerRow>
            <div>Override Java Arguments</div>
            <Switch
              checked={javaLocalArguments}
              onChange={v => {
                if (!v) {
                  setJavaLocalArguments(null);
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
          {javaLocalArguments && (
            <JavaManagerRow>
              <Input
                value={javaLocalArguments}
                onChange={e => {
                  setJavaLocalArguments(e.target.value);
                  debouncedArgumentsUpdate(e.target.value);
                }}
              />
              <JavaResetButton onClick={resetJavaArguments}>
                <FontAwesomeIcon icon={faUndo} />
              </JavaResetButton>
            </JavaManagerRow>
          )}
          <JavaManagerRow>
            <div>Custom Java Path {`<Java ${javaVersion}>`} </div>
            <Switch
              checked={customJavaPath}
              onChange={v => {
                if (!v) {
                  setCustomJavaPath(null);
                  dispatch(
                    updateInstanceConfig(instanceName, prev =>
                      omit(prev, ['customJavaPath'])
                    )
                  );
                } else if (v) {
                  resetCustomJavaPath();
                }
              }}
            />
          </JavaManagerRow>
          {customJavaPath && (
            <JavaManagerRow>
              <Input
                value={customJavaPath}
                onChange={e => {
                  setCustomJavaPath(e.target.value);
                  debouncedJavaPathUpdate(e.target.value);
                }}
              />

              <Button
                color="primary"
                onClick={async () => {
                  const { filePaths, canceled } = await ipcRenderer.invoke(
                    'openFileDialog',
                    defaultJavaPath
                  );
                  if (!filePaths[0] || canceled) return;
                  setCustomJavaPath(filePaths[0]);
                  updateCustomJavaPath(filePaths[0]);
                }}
              >
                <FontAwesomeIcon icon={faFolder} />
              </Button>
              <JavaResetButton onClick={resetCustomJavaPath}>
                <FontAwesomeIcon icon={faUndo} />
              </JavaResetButton>
            </JavaManagerRow>
          )}
        </OverviewCard>
      </Column>
    </Container>
  );
};

export default Overview;
