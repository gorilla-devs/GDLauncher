import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from 'antd';
import { useDispatch } from 'react-redux';
import Modal from '../../components/Modal';
import General from './components/General';
import Java from './components/Java';
import CloseButton from '../../components/CloseButton';
import { closeModal } from '../../reducers/modals/actions';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
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

const SettingsContainer = styled.div`
  flex: 1;
  flex-grow: 3;
`;

const SettingsColumn = styled.div`
  margin-left: 50px;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
`;

// eslint-disable-next-line react/jsx-props-no-spreading
const SettingsButton = styled(({ active, ...props }) => <Button {...props} />)`
  align-items: left;
  justify-content: left;
  text-align: left;
  width: 200px;
  height: 30px;
  border-radius: 4px 0 0 4px;
  font-size: 12px;
  white-space: nowrap;
  background: ${props =>
    props.active
      ? props.theme.palette.grey[600]
      : props.theme.palette.grey[800]};
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
    case 'General':
      return <General />;
    case 'Java':
      return <Java />;
    default:
      return null;
  }
}

export default function Settings() {
  const [page, setPage] = useState('General');
  const dispatch = useDispatch();
  return (
    <Modal
      css={`
        height: 100%;
        width: 100%;
      `}
      header="false"
    >
      <Container>
        <CloseButton
          css={`
            position: absolute;
            top: 30px;
            right: 30px;
          `}
          onClick={() => dispatch(closeModal())}
        />
        <SideMenu>
          <SettingsTitle>General</SettingsTitle>
          <SettingsButton
            active={page === 'General'}
            onClick={() => setPage('General')}
          >
            General
          </SettingsButton>
          <SettingsButton
            active={page === 'Java'}
            onClick={() => setPage('Java')}
          >
            Java
          </SettingsButton>
          {/* <SettingsButton onClick={() => setPage("User Interface")}>
            User Interface
          </SettingsButton>
          <SettingsTitle>Game Settings</SettingsTitle>
          <SettingsButton>Graphic Settings</SettingsButton>
          <SettingsButton>Sound Settings</SettingsButton> */}
        </SideMenu>
        <SettingsContainer>
          <SettingsColumn>
            <div
              css={`
                max-width: 600px;
                overflow-y: hidden;
                overflow-x: hidden;
              `}
            >
              {Page(page)}
            </div>
          </SettingsColumn>
        </SettingsContainer>
      </Container>
    </Modal>
  );
}
