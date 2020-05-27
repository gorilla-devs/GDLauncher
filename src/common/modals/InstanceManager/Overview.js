/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
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
  faTimes,
  faCog
} from '@fortawesome/free-solid-svg-icons';
import { Input, Button, Switch, Slider, Select, Cascader } from 'antd';
import { ipcRenderer } from 'electron';
import { _getInstancesPath, _getInstance } from '../../utils/selectors';
import {
  DEFAULT_JAVA_ARGS,
  resolutionPresets
} from '../../../app/desktop/utils/constants';
import { updateInstanceConfig, addToQueue } from '../../reducers/actions';
import { convertMinutesToHumanTime, sortByForgeVersionDesc } from '../../utils';
import { closeModal } from '../../reducers/modals/actions';

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

const CustomInput = styled(Input)`
  height: 20px;
  margin-top: 5px;
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
  const [minecraftVersion, setMinecraftVersion] = useState(false);
  const [modloader, setModLoader] = useState(false);
  const vanillaManifest = useSelector(state => state.app.vanillaManifest);
  const fabricManifest = useSelector(state => state.app.fabricManifest);
  const forgeManifest = useSelector(state => state.app.forgeManifest);

  const instancePath = useSelector(state =>
    path.join(_getInstancesPath(state), instanceName)
  );

  const dispatch = useDispatch();

  const VanillafilteredVersions = useMemo(() => {
    const snapshots = vanillaManifest.versions
      .filter(v => v.type === 'snapshot')
      .map(v => v.id);
    const versions = [
      {
        value: 'release',
        label: 'Releases',
        children: vanillaManifest.versions
          .filter(v => v.type === 'release')
          .map(v => ({
            value: v.id,
            label: v.id
          }))
      },
      {
        value: 'snapshot',
        label: 'Snapshots',
        children: vanillaManifest.versions
          .filter(v => v.type === 'snapshot')
          .map(v => ({
            value: v.id,
            label: v.id
          }))
      },
      {
        value: 'old_beta',
        label: 'Old Beta',
        children: vanillaManifest.versions
          .filter(v => v.type === 'old_beta')
          .map(v => ({
            value: v.id,
            label: v.id
          }))
      },
      {
        value: 'old_alpha',
        label: 'Old Alpha',
        children: vanillaManifest.versions
          .filter(v => v.type === 'old_alpha')
          .map(v => ({
            value: v.id,
            label: v.id
          }))
      }
    ];
    return versions;
  }, [vanillaManifest, fabricManifest, forgeManifest]);

  const ForgefilteredVersions = useMemo(() => {
    const versions = [
      {
        value: 'release',
        label: 'Releases',
        children: Object.entries(forgeManifest).map(([k, v]) => ({
          value: k,
          label: k,
          children: v.sort(sortByForgeVersionDesc).map(child => ({
            value: child,
            label: child.split('-')[1]
          }))
        }))
      }
    ];
    return versions;
  }, [vanillaManifest, fabricManifest, forgeManifest]);

  const FabricfilteredVersions = useMemo(() => {
    const snapshots = vanillaManifest.versions
      .filter(v => v.type === 'snapshot')
      .map(v => v.id);
    const versions = [
      {
        value: 'release',
        label: 'Releases',
        children: fabricManifest.mappings
          .filter(v => !snapshots.includes(v.gameVersion))
          .map(v => ({
            value: v.version,
            label: v.version,
            children: fabricManifest.loader.map(c => ({
              value: c.version,
              label: c.version
            }))
          }))
      },
      {
        value: 'snapshot',
        label: 'Snapshots',
        children: fabricManifest.mappings
          .filter(v => snapshots.includes(v.gameVersion))
          .map(v => ({
            value: v.version,
            label: v.version,
            children: fabricManifest.loader.map(c => ({
              value: c.version,
              label: c.version
            }))
          }))
      }
    ];
    return versions;
  }, [vanillaManifest, fabricManifest, forgeManifest]);

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

  const calcCoscaderContent = v => {
    switch (v) {
      case 'vanilla':
        return VanillafilteredVersions;
      case 'forge':
        return ForgefilteredVersions;
      case 'fabric':
        return FabricfilteredVersions;
    }
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
              background: ${props => props.theme.palette.colors.jungleGreen};
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
              {minecraftVersion ? null : 'Minecraft Version'}
            </div>

            <div
              css={`
                position: absolute;
                top: 5px;
                right: 10px;
                font-size: 10px;
                color: ${props => props.theme.palette.text.secondary};
              `}
            >
              <FontAwesomeIcon
                icon={faCog}
                onClick={() => {
                  setMinecraftVersion(!minecraftVersion);
                }}
              />
            </div>

            {minecraftVersion ? (
              <Cascader
                // value={config?.modloader[1]}
                options={calcCoscaderContent(config?.modloader[0])}
                onChange={async v => {
                  console.log(v, instancePath, config?.modloader[3]);
                  if (config?.modloader[0] === 'forge') {
                    console.log('pippo', instancePath);
                    try {
                      const manifest = await fss.readJson(
                        path.join(instancePath, 'manifest.json')
                      );

                      dispatch(
                        addToQueue(
                          instanceName,
                          [
                            config?.modloader[0],
                            v[1],
                            v[2],
                            config?.modloader[3],
                            config?.modloader[4]
                          ],
                          // config?.modloader,
                          manifest,
                          `background${path.extname(config?.background)}`
                        )
                      );
                    } catch (e) {
                      console.error(e);
                      dispatch(
                        addToQueue(instanceName, [
                          config?.modloader[0],
                          v[1],
                          v[2],
                          config?.modloader[3],
                          config?.modloader[4]
                        ])
                      );
                    }
                  } else if (config?.modloader[0] === 'vanilla') {
                    dispatch(
                      addToQueue(
                        instanceName,

                        null,
                        `background${path.extname(config?.background)}`
                      )
                    );
                  }
                  // const manifest = await fss.readJson(
                  //   path.join(instancePath, 'manifest.json')
                  // );

                  // dispatch(
                  //   addToQueue(
                  //     instanceName,
                  //     [config?.modloader[0],"1.12.2","1.12.2-14.23.5.2838",285109,2935316]
                  //     // config?.modloader,
                  //     manifest,
                  //     `background${path.extname(config?.background)}`
                  //   )
                  // );
                  setMinecraftVersion(false);
                  dispatch(closeModal());
                }}
                placeholder="Select a version"
                size="large"
                css={`
                  input {
                    height: 32px;
                  }
                  width: 100px;
                `}
              />
            ) : (
              <div>{config?.modloader[1]}</div>
            )}
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
                color: ${props => props.theme.palette.text.secondary};
              `}
            >
              {modloader ? null : 'Modloader'}
            </div>
            <div
              css={`
                position: absolute;
                top: 5px;
                right: 10px;
                font-size: 10px;
                color: ${props => props.theme.palette.text.secondary};
              `}
            >
              <FontAwesomeIcon
                icon={faCog}
                onClick={() => setModLoader(!modloader)}
              />
            </div>
            {modloader ? (
              <Select
                onChange={async v => {
                  const snapshots = vanillaManifest.versions
                    .filter(v => v.type === 'snapshot')
                    .map(v => v.id);
                  console.log('v', [
                    v,
                    config?.modloader[1],
                    config?.modloader[2]
                  ]);
                  if (v === 'vanilla') {
                    try {
                      dispatch(
                        addToQueue(instanceName, [v, config?.modloader[1]])
                      );
                    } catch (e) {
                      console.error(e);
                    }
                    console.log([
                      v,
                      config?.modloader[1],
                      config?.modloader[2],
                      config?.modloader[3],
                      config?.modloader[4]
                    ]);
                  } else if (v === 'forge') {
                    console.log('forge', instancePath, [
                      v,
                      config?.modloader[1]
                    ]);

                    try {
                      // const manifest = await fss.readJson(
                      //   path.join(instancePath, 'manifest.json')
                      // );

                      dispatch(
                        addToQueue(
                          instanceName,
                          [
                            v,
                            config?.modloader[1],
                            Object.entries(forgeManifest).filter(
                              x => x[0] === config?.modloader[1]
                            )[0][1][0]
                          ],
                          null
                          // `background${path.extname(config?.background)}`
                        )
                      );
                    } catch (e) {
                      console.error(e);
                    }
                  } else {
                    dispatch(
                      addToQueue(
                        instanceName,
                        [
                          v,
                          config?.modloader[1],
                          fabricManifest.mappings
                            .filter(v => !snapshots.includes(v.gameVersion))
                            .filter(
                              x => x.gameVersion === config?.modloader[1]
                            )[0].version
                        ]
                        // manifest,
                        // `background${path.extname(config?.background)}`
                      )
                    );
                    console.log([
                      v,
                      config?.modloader[1],
                      config?.modloader[2],
                      config?.modloader[3],
                      config?.modloader[4]
                    ]);
                  }

                  setModLoader(false);
                  dispatch(closeModal());
                }}
                css={`
                  .ant-select-selector {
                    background: ${props =>
                      props.theme.palette.colors.darkYellow};
                  }
                  width: 100px;

                  border: 2px solid
                    ${props => props.theme.palette.colors.orange};
                `}
                value={config?.modloader[0]}
              >
                <Select.Option value={'vanilla'}>Vanilla</Select.Option>
                <Select.Option value={'forge'}>Forge</Select.Option>
                <Select.Option value={'fabric'}>Fabric</Select.Option>
              </Select>
            ) : (
              <div>{config?.modloader[0]}</div>
            )}
          </CardBox>
          <CardBox
            css={`
              background: ${props => props.theme.palette.colors.lightBlue};
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
              Modloader Version
            </div>
            {(config?.modloader[2] || '-') !== '-' ? (
              <div
                css={`
                  position: absolute;
                  top: 5px;
                  right: 10px;
                  font-size: 10px;
                  color: ${props => props.theme.palette.text.secondary};
                `}
              >
                <FontAwesomeIcon icon={faCog} />
              </div>
            ) : (
              ''
            )}
            <div>
              {config?.modloader[0] === 'forge'
                ? config?.modloader[2]?.split('-')[1]
                : config?.modloader[2] || '-'}
            </div>
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
              background: ${props => props.theme.palette.colors.maximumRed};
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
              Mods
            </div>
            <div>{config?.mods?.length || '-'}</div>
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
                color: ${props => props.theme.palette.text.secondary};
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
                color: ${props => props.theme.palette.text.secondary};
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
