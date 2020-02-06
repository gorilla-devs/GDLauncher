import React from "react";
import styled from "styled-components";
import { Button } from "antd";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
`;

const SideMenu = styled.div`
  display: flex;
  flex: 0;
  flex-direction: column;
  align-items: flex-end;
  background: green;
  height: 100%;
  flex-grow: 1;
  flex-direction: column;
  background: ${props => props.theme.palette.grey[800]};
  padding: calc(${props => props.theme.sizes.height.systemNavbar} + 5px);
`;

const SettingsContent = styled.div`
  flex: 0;
  background: red;
  height: 100%;
  flex: 1;
  flex-grow: 3;
  background: ${props => props.theme.palette.secondary.main};
  padding: calc(${props => props.theme.sizes.height.systemNavbar} + 5px);
`;

const SettingsColumn = styled.div`
  position: absolute;
  top: 0;
  bot: 0;
  height: 100%;
  width: 50%;
  background: transparent;
  margin: 0 auto;
`;

const SettingsButton = styled(Button)`
  align-items: left;
  justify-content: left;
  text-align: left;
  width: 200px;
  height: 30px;
  border-radius: 4px 0 0 4px;
  font-size: 12px;
  white-space: nowrap;
  background: transparent;
  border: 0px;
  text-align: left;
  animation-duration: 0s;
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

const Content = () => {
  return (
    <Container>
      <SideMenu>
        <SettingsButton>Overview</SettingsButton>
        <SettingsButton>Mods</SettingsButton>
        <SettingsButton>Modpack</SettingsButton>
        <SettingsButton>Notes</SettingsButton>
        <SettingsButton>Resource Packs</SettingsButton>
        <SettingsButton>Worlds</SettingsButton>
        <SettingsButton>Screenshots</SettingsButton>
        <SettingsButton>Settings</SettingsButton>
        <SettingsButton>Servers</SettingsButton>
      </SideMenu>
      <SettingsContent>
        <SettingsColumn>Settings</SettingsColumn>
      </SettingsContent>
    </Container>
  );
};

export default Content;
