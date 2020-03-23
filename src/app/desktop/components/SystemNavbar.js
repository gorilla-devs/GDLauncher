import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWindowMinimize,
  faWindowMaximize,
  faWindowRestore,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

const SystemNavbar = () => {
  const [isMaximized, setIsMaximized] = useState(false);
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

  return (
    <Container>
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
        onClick={() => ipcRenderer.invoke('quit-app')}
      >
        <FontAwesomeIcon icon={faTimes} />
      </div>
    </Container>
  );
};

export default SystemNavbar;

const Container = styled.div`
  width: 100%;
  height: ${({ theme }) => theme.sizes.height.systemNavbar}px;
  background: ${({ theme }) => theme.palette.grey[900]};
  -webkit-app-region: drag;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  & > * {
    -webkit-app-region: no-drag;
    width: 35px;
    height: 100%;
    display: flex;
    justify-content: center;
    cursor: pointer;
    align-items: center;
    transition: background 0.1s ease-in-out;
    &:hover {
      background: ${({ theme }) => theme.palette.grey[700]};
    }
  }
  & > *:last-child {
    &:hover {
      background: ${({ theme }) => theme.palette.colors.red};
    }
  }
`;
