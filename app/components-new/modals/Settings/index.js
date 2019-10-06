import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Modal from 'components/Common/Modal';
import { Button } from 'ui';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose } from '@fortawesome/free-solid-svg-icons';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  text-align: center;
`;
const SideMenu = styled.div`
  flex: 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  background: ${props => props.theme.palette.grey[800]};
  padding-top: calc(${props => props.theme.sizes.height.systemNavbar} + 5px);
`;

const Settings = styled.div`
  flex: 1;
  flex-grow: 3;
  background: ${props => props.theme.palette.secondary.main};
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
  color: ${props => props.theme.palette.text.primary};
`;

const SettingsTitle = styled.div`
  margin-top: 15px;
  align-items: left;
  justify-content: left;
  text-align: left;
  width: 200px;
  height: 30px;
  border-radius: 4px 0 0 4px;
  font-size: 12px;
  font-weight: 300;
  white-space: nowrap;
  color: ${props => props.theme.palette.grey[50]};
`;

export default props => {
  return (
    <Modal
      header={false}
      height="100%"
      width="100%"
      backBtn={
        <FontAwesomeIcon
          icon={faWindowClose}
          css={`
            position: absolute;
            top: 15px;
            right: 15px;
            cursor: pointer;
            transition: color 0.1s ease-in-out;
            &:hover {
              color: ${props => props.theme.palette.colors.red};
            }
          `}
        />
      }
    >
      <Container>
        <SideMenu>
          <SettingsTitle>General</SettingsTitle>
          <SettingsButton>My Account Preferences</SettingsButton>
          <SettingsButton>Java</SettingsButton>
          <SettingsButton>Instances</SettingsButton>
          <SettingsButton>User Interface</SettingsButton>
          <SettingsTitle>Game Settings</SettingsTitle>
          <SettingsButton>Graphic Settings</SettingsButton>
          <SettingsButton>Sound Settings</SettingsButton>
        </SideMenu>
        <Settings></Settings>
      </Container>
    </Modal>
  );
};
