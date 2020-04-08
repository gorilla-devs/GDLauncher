/* eslint-disable */
import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from 'antd';
import Modal from '../../components/Modal';
import Overview from './Overview';
import Screenshots from './Screenshots';
import Notes from './Notes';
import Mods from './Mods';
import { useSelector } from 'react-redux';
import { _getInstance } from '../../utils/selectors';
import { FORGE, FABRIC } from '../../utils/constants';
import Modpack from './Modpack';

const SideMenu = styled.div`
  display: flex;
  flex: 0;
  flex-direction: column;
  align-items: flex-end;
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

const InstanceManager = ({ instanceName }) => {
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

  const [page, setPage] = useState(Object.keys(menuEntries)[0]);
  const instance = useSelector(state => _getInstance(state)(instanceName));
  const ContentComponent = menuEntries[page].component;

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
