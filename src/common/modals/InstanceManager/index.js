/* eslint-disable */
import React, { useState } from "react";
import styled from "styled-components";
import { Button } from "antd";
import Modal from "../../components/Modal";
import Overview from "./Overview";
import ScreenShot from "./ScreenShot";
import Notes from "./Notes";
import Mods from "./Mods";

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
  width: 150px;
  height: 30px;
  border-radius: 4px 0 0 4px;
  font-size: 12px;
  white-space: nowrap;
  background: ${props =>
    props.active ? props.theme.palette.grey[600] : "transparent"};
  border: 0px;
  text-align: left;
  animation-duration: 0s;
  color: ${props => props.theme.palette.text.primary};
  &:hover {
    color: ${props => props.theme.palette.text.primary};
    background: ${props => props.theme.palette.grey[props.active ? 600 : 700]};
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
  width: 100%;
  height: 100%;
  padding: 10px;
`;

const InstanceManager = ({ instanceName }) => {
  const menuEntries = {
    overview: { name: "Overview", component: Overview },
    mods: { name: "Mods", component: Mods },
    modpack: { name: "Modpack", component: Overview },
    notes: { name: "Notes", component: Notes },
    resourcePacks: { name: "Resource Packs", component: Overview },
    worlds: { name: "Worlds", component: Overview },
    screenshots: { name: "Screenshots", component: ScreenShot },
    settings: { name: "Settings", component: Overview },
    servers: { name: "Servers", component: Overview }
  };

  const [page, setPage] = useState(Object.keys(menuEntries)[0]);
  const ContentComponent = menuEntries[page].component;

  return (
    <Modal
      css={`
        height: 85%;
        width: 85%;
        max-width: 1500px;
      `}
      title="Instance Manager"
      removePadding
    >
      <Container>
        <SideMenuContainer>
          <SideMenu>
            {Object.entries(menuEntries).map(([k, tab]) => (
              <SettingsButton
                key={tab.name}
                onClick={e => setPage(k)}
                active={k === page}
              >
                {tab.name}
              </SettingsButton>
            ))}
          </SideMenu>
        </SideMenuContainer>
        <Content>
          <ContentComponent instanceName={instanceName} />
        </Content>
      </Container>
    </Modal>
  );
};

export default React.memo(InstanceManager);
