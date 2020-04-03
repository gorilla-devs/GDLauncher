import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWindowMinimize,
  faWindowMaximize,
  faWindowRestore,
  faTimes,
  faTerminal
} from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';

const SystemNavbar = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const isUpdateAvailable = useSelector(state => state.updateAvailable);

  useEffect(() => {
    ipcRenderer
      .invoke('getIsWindowMaximized')
      .then(setIsMaximized)
      .catch(console.error);
    ipcRenderer.on('window-maximized', () => {
      setIsMaximized(true);
    });
    ipcRenderer.on('window-minimized', () => {
      setIsMaximized(false);
    });
  }, []);

  const openDevTools = () => {
    ipcRenderer.invoke('open-devtools');
  };

  const isOsx = process.platform === 'darwin';

  const DevtoolButton = () => (
    <TerminalButton onClick={openDevTools}>
      <FontAwesomeIcon icon={faTerminal} />
    </TerminalButton>
  );

  const quitApp = () => {
    if (isUpdateAvailable) {
      ipcRenderer.invoke('installUpdateAndQuitOrRestart', true);
    } else {
      ipcRenderer.invoke('quit-app');
    }
  };

  return (
    <MainContainer>
      {!isOsx && <DevtoolButton />}
      <Container os={isOsx}>
        {!isOsx ? (
          <>
            <div onClick={() => ipcRenderer.invoke('minimize-window')}>
              <FontAwesomeIcon icon={faWindowMinimize} />
            </div>
            <div onClick={() => ipcRenderer.invoke('min-max-window')}>
              <FontAwesomeIcon
                icon={isMaximized ? faWindowRestore : faWindowMaximize}
              />
            </div>
            <div
              css={`
                font-size: 18px;
              `}
              onClick={quitApp}
            >
              <FontAwesomeIcon icon={faTimes} />
            </div>
          </>
        ) : (
          <>
            <div
              css={`
                font-size: 18px;
              `}
              onClick={quitApp}
            >
              <FontAwesomeIcon icon={faTimes} />
            </div>
            <div onClick={() => ipcRenderer.invoke('minimize-window')}>
              <FontAwesomeIcon icon={faWindowMinimize} />
            </div>
            <div onClick={() => ipcRenderer.invoke('min-max-window')}>
              <FontAwesomeIcon
                icon={isMaximized ? faWindowRestore : faWindowMaximize}
              />
            </div>
          </>
        )}
      </Container>
      {isOsx && <DevtoolButton />}
    </MainContainer>
  );
};

export default SystemNavbar;

const MainContainer = styled.div`
  width: 100%;
  height: ${({ theme }) => theme.sizes.height.systemNavbar}px;
  background: ${({ theme }) => theme.palette.grey[900]};
  -webkit-app-region: drag;
  display: flex;
  align-items: center;
  justify-content: space-between;
  & > * {
    -webkit-app-region: no-drag;
    width: 35px;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: background 0.1s ease-in-out;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 90px;
  & > * {
    -webkit-app-region: no-drag;
    width: 35px;
    height: 100%;
    display: flex;
    justify-content: center;
    cursor: pointer;
    align-items: center;
    &:hover {
      background: ${({ theme }) => theme.palette.grey[700]};
    }
  }
  ${props => (props.os ? '& > *:first-child' : '& > *:last-child')} {
    &:hover {
      background: ${({ theme }) => theme.palette.colors.red};
    }
  }
`;

const TerminalButton = styled.div`
  transition: background 0.1s ease-in-out;
  &:hover {
    background: ${({ theme }) => theme.palette.grey[700]};
  }
`;
