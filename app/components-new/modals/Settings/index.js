import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Modal from 'components/Common/Modal';
// import MyAccountPrf from 'components/Common/Modal/Settings/components/MyAccount_preferences';
import MyAccountPrf from './components/MyAccount_preferences';
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

const SettingsColumn = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 476px;
  height: '100%';
  background: transparent;
  left: 30%;
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

function Page(page) {
  switch (page) {
    case 'MyAccountPrf':
      return <MyAccountPrf />;
    case 'Java':
      return <div>Java</div>;
    case 'Instances':
      return <div>Instances</div>;
    case 'User Interface':
      return <div>User Interface</div>;
    default:
      return null;
  }
}

export default props => {
  const [page, setPage] = useState('MyAccountPrf');
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
          <SettingsButton onClick={() => setPage('MyAccountPrf')}>
            My Account Preferences
          </SettingsButton>
          <SettingsButton onClick={() => setPage('Java')}>Java</SettingsButton>
          <SettingsButton onClick={() => setPage('Instances')}>
            Instances
          </SettingsButton>
          <SettingsButton onClick={() => setPage('User Interface')}>
            User Interface
          </SettingsButton>
          <SettingsTitle>Game Settings</SettingsTitle>
          <SettingsButton>Graphic Settings</SettingsButton>
          <SettingsButton>Sound Settings</SettingsButton>
        </SideMenu>
        <Settings>
          <SettingsColumn>{Page(page)}</SettingsColumn>
        </Settings>
      </Container>
    </Modal>
  );
};
