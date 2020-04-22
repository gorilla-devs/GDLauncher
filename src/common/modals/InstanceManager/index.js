/* eslint-disable */
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button } from 'antd';
import fss from 'fs-extra';
import { promises as fs } from 'fs';
import path from 'path';
import Modal from '../../components/Modal';
import Overview from './Overview';
import { ipcRenderer } from 'electron';
import Screenshots from './Screenshots';
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
  background: ${props => props.theme.palette.secondary.main};
`;

const SettingsButton = styled(Button)`
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
    props.active ? props.theme.palette.grey[600] : 'transparent'};
  border: 0px;
  text-align: left;
  color: ${props => props.theme.palette.text.primary};
  &:hover {
    color: ${props => props.theme.palette.text.primary};
    background: ${props => props.theme.palette.grey[props.active ? 600 : 800]};
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
  border-radius: 50%;
  background: ${props => props.theme.palette.grey[700]};
  opacity: 0;
  transition: opacity 0.2s ease;
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
  margin-bottom: 20px;
  background: ${props =>
    props.imagePath
      ? `url(${props.imagePath}) center no-repeat`
      : props.theme.palette.primary.dark};
  background-size: 120px;
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
  const ContentComponent = menuEntries[page].component;

  const updateBackGround = v => {
    dispatch(
      updateInstanceConfig(instanceName, prev => ({
        ...prev,
        background: v
      }))
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
    const filePath = path.join(instancePath, `${fileName}.${ext}`);
    await fss.copy(dialog.filePaths[0], filePath);

    fs.readFile(filePath)
      .then(res =>
        setBackground(`data:image/png;base64,${res.toString('base64')}`)
      )
      .catch(console.warning);
    setBackground(filePath);
    updateBackGround(`${fileName}.${ext}`);
  };

  useEffect(() => {
    if (instance?.background) {
      fs.readFile(path.join(instancesPath, instanceName, instance?.background))
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
          />
        </Content>
      </Container>
    </Modal>
  );
};

export default React.memo(InstanceManager);
