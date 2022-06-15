import React, { useState, useEffect, lazy } from 'react';
import styled, { keyframes } from 'styled-components';
import { Button } from 'antd';
import fse from 'fs-extra';
import { promises as fs } from 'fs';
import path from 'path';
import { ipcRenderer } from 'electron';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faStop,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import omit from 'lodash/omit';
import psTree from 'ps-tree';
import { useSelector, useDispatch } from 'react-redux';
import Modal from '../../components/Modal';
import AsyncComponent from '../../components/AsyncComponent';
import { _getInstance, _getInstancesPath } from '../../utils/selectors';
import { FORGE, FABRIC, CURSEFORGE } from '../../utils/constants';
import {
  addStartedInstance,
  clearLatestModManifests,
  launchInstance,
  updateInstanceConfig
} from '../../reducers/actions';
import instanceDefaultBackground from '../../assets/instance_default.png';

const SideMenu = styled.div`
  display: flex;
  flex: 0;
  flex-direction: column;
  align-items: center;
  height: 100%;
  flex-grow: 1;
`;

const SideMenuContainer = styled.div`
  height: 100%;
  flex: 1;
  flex-grow: 3;
  background: ${props => props.theme.palette.grey[800]};
`;

// eslint-disable-next-line react/jsx-props-no-spreading
const SettingsButton = styled(({ active, ...props }) => <Button {...props} />)`
  align-items: left;
  justify-content: left;
  text-align: left;
  width: 170px;
  height: 40px;
  border-radius: 4px 0 0 4px;
  font-size: 13px;
  transition: all 0.2s ease-in-out;
  white-space: nowrap;
  background: ${props =>
    props.active
      ? props.theme.palette.grey[600]
      : props.theme.palette.grey[800]};
  border: 0px;
  text-align: left;
  color: ${props => props.theme.palette.text.primary};
  &:hover {
    color: ${props => props.theme.palette.text.primary};
    background: ${props => props.theme.palette.grey[700]};
  }
  &:focus {
    color: ${props => props.theme.palette.text.primary};
    background: ${props => props.theme.palette.grey[600]};
  }
`;

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 10px;
  position: relative;
`;

const Overlay = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 10%;
  background: ${props => props.theme.palette.grey[800]};
  opacity: 0;
  transition: opacity 0.2s ease;
`;

const InstanceBackground = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 130px;
  height: 100px;
  border-radius: 10%;
  margin-bottom: 20px;
  margin-top: 10px;
  background: ${props =>
    props.imagePath
      ? `url(${props.imagePath}) center no-repeat`
      : `url(${instanceDefaultBackground}) center no-repeat`};
  background-size: 180px;
  transition: opacity 0.2s ease;
  &:hover svg {
    opacity: 1;
    z-index: 2;
  }

  &:hover p {
    opacity: 1;
    z-index: 2;
  }

  &:hover ${Overlay} {
    opacity: 0.9;
  }

  svg {
    margin-top: 10px;
    width: 30px;
    color: ${props => props.theme.palette.colors.red};
    opacity: 0;
  }

  p {
    width: 50px;
    text-align: center;
    opacity: 0;
  }
`;

const Spinner = keyframes`
  0% {
    transform: translate3d(-50%, -50%, 0) rotate(0deg);
  }
  100% {
    transform: translate3d(-50%, -50%, 0) rotate(360deg);
  }
`;

const PlayButtonAnimation = keyframes`
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const menuEntries = {
  overview: {
    name: 'Overview',
    component: AsyncComponent(lazy(() => import('./Overview')))
  },
  mods: {
    name: 'Mods',
    component: AsyncComponent(lazy(() => import('./Mods')))
  },
  modpack: {
    name: 'Modpack',
    component: AsyncComponent(lazy(() => import('./Modpack')))
  },
  notes: {
    name: 'Notes',
    component: AsyncComponent(lazy(() => import('./Notes')))
  },
  resourcePacks: {
    name: 'Resource Packs',
    component: AsyncComponent(lazy(() => import('./ResourcePacks')))
  },
  // resourcePacks: { name: "Resource Packs", component: Overview },
  // worlds: { name: "Worlds", component: Overview },
  screenshots: {
    name: 'Screenshots',
    component: AsyncComponent(lazy(() => import('./Screenshots')))
  }
  // settings: { name: "Settings", component: Overview },
  // servers: { name: "Servers", component: Overview }
};

const InstanceManager = ({ instanceName }) => {
  const dispatch = useDispatch();
  const instancesPath = useSelector(_getInstancesPath);
  const [page, setPage] = useState(Object.keys(menuEntries)[0]);
  const instance = useSelector(state => _getInstance(state)(instanceName));
  const startedInstances = useSelector(state => state.startedInstances);
  const [background, setBackground] = useState(instance?.background);
  const [manifest, setManifest] = useState(null);
  const ContentComponent = menuEntries[page].component;

  const isPlaying = startedInstances[instanceName];

  const updateBackground = v => {
    if (v) {
      dispatch(
        updateInstanceConfig(instanceName, prev => ({
          ...prev,
          background: v
        }))
      );
    } else {
      dispatch(
        updateInstanceConfig(instanceName, prev => ({
          ...omit(prev, ['background'])
        }))
      );
    }
  };

  const openFileDialog = async () => {
    const dialog = await ipcRenderer.invoke('openFileDialog', [
      { name: 'Image', extensions: ['png', 'jpg', 'jpeg'] }
    ]);
    if (dialog.canceled) return;
    const instancePath = path.join(instancesPath, instanceName);
    const ext = path.extname(dialog.filePaths[0]);
    const filePath = path.join(instancePath, `background${ext}`);
    await fse.copy(dialog.filePaths[0], filePath);
    const res = await fs.readFile(filePath);
    setBackground(`data:image/png;base64,${res.toString('base64')}`);
    updateBackground(`background${ext}`);
  };

  useEffect(() => {
    if (instance?.background) {
      fs.readFile(path.join(instancesPath, instanceName, instance.background))
        .then(res =>
          setBackground(`data:image/png;base64,${res.toString('base64')}`)
        )
        .catch(console.warning);
    }
  }, []);

  useEffect(() => {
    dispatch(clearLatestModManifests());
  }, []);

  useEffect(() => {
    if (instance?.loader.source === CURSEFORGE) {
      fse
        .readJson(path.join(instancesPath, instanceName, 'manifest.json'))
        .then(setManifest)
        .catch(console.error);
    }
  }, []);

  return (
    <Modal
      css={`
        height: 85%;
        width: 85%;
        max-width: 1500px;
      `}
      title={`Instance Manager - ${instanceName}`}
      removePadding
    >
      <Container>
        <SideMenuContainer>
          <SideMenu>
            <InstanceBackground onClick={openFileDialog} imagePath={background}>
              <Overlay />
              <p>Change Icon</p>
              {background && (
                <FontAwesomeIcon
                  icon={faTimesCircle}
                  css={`
                    cursor: pointer;
                    font-size: 20px;
                  `}
                  onClick={e => {
                    e.stopPropagation();
                    updateBackground(null);
                    setBackground(null);
                  }}
                />
              )}
            </InstanceBackground>
            <div
              css={`
                display: flex;
                margin-bottom: 20px;
              `}
            >
              <div
                css={`
                  position: relative;
                  background: ${props => props.theme.palette.colors.green};
                  padding: 5px 10px;
                  border-radius: 10px 0 0 10px;
                  font-size: 16px;
                  font-weight: bold;
                  width: 80px;
                  height: 35px;
                  text-align: center;
                  cursor: ${props => (props.isPlaying ? 'default' : 'pointer')};

                  .spinner:before {
                    animation: 1.5s linear infinite ${Spinner};
                    animation-play-state: inherit;
                    border: solid 3px transparent;
                    border-bottom-color: ${props =>
                      props.theme.palette.common.white};
                    border-radius: 50%;
                    content: '';
                    height: 20px;
                    width: 20px;
                    position: absolute;
                    top: 13px;
                    transform: translate3d(-50%, -50%, 0);
                    will-change: transform;
                  }
                `}
                isPlaying={isPlaying}
                onClick={() => {
                  if (isPlaying) return;
                  dispatch(addStartedInstance({ instanceName }));
                  dispatch(launchInstance(instanceName));
                }}
              >
                {isPlaying ? (
                  <div
                    css={`
                      position: relative;
                      display: grid;
                      place-items: center;
                      width: 100%;
                      height: 100%;
                    `}
                  >
                    {isPlaying.initialized && (
                      <FontAwesomeIcon
                        css={`
                          color: ${({ theme }) => theme.palette.common.white};
                          position: absolute;
                          margin-left: 6px;
                          animation: ${PlayButtonAnimation} 0.5s
                            cubic-bezier(0.75, -1.5, 0, 2.75);
                        `}
                        icon={faPlay}
                      />
                    )}
                    {!isPlaying.initialized && <div className="spinner" />}
                  </div>
                ) : (
                  <span>PLAY</span>
                )}
              </div>
              <div
                css={`
                  padding: 5px 15px;
                  display: grid;
                  font-size: 16px;
                  place-items: center;
                  background: ${props => props.theme.palette.colors.red};
                  border-radius: 0 10px 10px 0;
                  opacity: ${props => (props.isPlaying ? 1 : 0.3)};
                  cursor: ${props => (props.isPlaying ? 'pointer' : 'default')};
                `}
                isPlaying={isPlaying}
                onClick={() => {
                  if (!isPlaying) return;
                  psTree(isPlaying.pid, (err, children) => {
                    if (children?.length) {
                      children.forEach(el => {
                        if (el) {
                          try {
                            process.kill(el.PID);
                          } catch {
                            // No-op
                          }
                        }
                      });
                    } else {
                      try {
                        process.kill(isPlaying.pid);
                      } catch {
                        // No-op
                      }
                    }
                  });
                }}
              >
                <FontAwesomeIcon icon={faStop} />
              </div>
            </div>
            {Object.entries(menuEntries).map(([k, tab]) => {
              if (
                (tab.name === menuEntries.mods.name &&
                  instance?.loader?.loaderType !== FORGE &&
                  instance?.loader?.loaderType !== FABRIC) ||
                (tab.name === menuEntries.modpack.name &&
                  !instance?.loader?.fileID)
              ) {
                return null;
              }
              return (
                <SettingsButton
                  key={tab.name}
                  onClick={() => setPage(k)}
                  active={k === page}
                >
                  {tab.name}
                </SettingsButton>
              );
            })}
          </SideMenu>
        </SideMenuContainer>
        <Content>
          <ContentComponent
            instanceName={instanceName}
            modpackId={instance?.loader?.projectID}
            fileID={instance?.loader?.fileID}
            background={background}
            manifest={manifest}
          />
        </Content>
      </Container>
    </Modal>
  );
};

export default React.memo(InstanceManager);
