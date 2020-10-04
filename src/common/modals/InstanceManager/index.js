/* eslint-disable */
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button } from 'antd';
import fse from 'fs-extra';
import { promises as fs } from 'fs';
import path from 'path';
import Modal from '../../components/Modal';
import Overview from './Overview';
import Screenshots from './Screenshots';
import ResourcePacks from './ResourcePacks';
import Notes from './Notes';
import Mods from './Mods';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { useSelector, useDispatch } from 'react-redux';
import { _getInstance, _getInstancesPath } from '../../utils/selectors';
import { FORGE, FABRIC } from '../../utils/constants';
import Modpack from './Modpack';
import {
  initLatestMods,
  clearLatestModManifests,
  updateInstanceConfig
} from '../../reducers/actions';
import instanceDefaultBackground from '../../../common/assets/instance_default.png';
import omit from 'lodash/omit';
import sendMessage from '../../utils/sendMessage';
import EV from '../../messageEvents';

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

const menuEntries = {
  overview: { name: 'Overview', component: Overview },
  mods: { name: 'Mods', component: Mods },
  modpack: { name: 'Modpack', component: Modpack },
  notes: { name: 'Notes', component: Notes },
  resourcePacks: { name: 'Resource Packs', component: ResourcePacks },
  // resourcePacks: { name: "Resource Packs", component: Overview },
  // worlds: { name: "Worlds", component: Overview },
  screenshots: { name: 'Screenshots', component: Screenshots }
  // settings: { name: "Settings", component: Overview },
  // servers: { name: "Servers", component: Overview }
};

const InstanceManager = ({ instanceName }) => {
  const dispatch = useDispatch();
  const instancesPath = useSelector(_getInstancesPath);
  const [page, setPage] = useState(Object.keys(menuEntries)[0]);
  const instance = useSelector(state => _getInstance(state)(instanceName));
  const [background, setBackground] = useState(instance?.background);
  const [manifest, setManifest] = useState(null);
  const ContentComponent = menuEntries[page].component;

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
    const dialog = await sendMessage(EV.OPEN_FILE_DIALOG, [
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
    if ((instance?.modloader || []).slice(3, 5).length === 2) {
      fse
        .readJson(path.join(instancesPath, instanceName, 'manifest.json'))
        .then(setManifest)
        .catch(console.error);
    }
  }, []);

  useEffect(() => {
    if (instance?.name) {
      dispatch(initLatestMods(instance.name));
    }
  }, [instance?.mods]);

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
            {Object.entries(menuEntries).map(([k, tab]) => {
              if (
                (tab.name === menuEntries.mods.name &&
                  instance?.modloader[0] !== FORGE &&
                  instance?.modloader[0] !== FABRIC) ||
                (tab.name === menuEntries.modpack.name &&
                  !instance?.modloader[3])
              ) {
                return null;
              }
              return (
                <SettingsButton
                  key={tab.name}
                  onClick={e => setPage(k)}
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
            modpackId={instance?.modloader[3]}
            background={background}
            manifest={manifest}
          />
        </Content>
      </Container>
    </Modal>
  );
};

export default React.memo(InstanceManager);
