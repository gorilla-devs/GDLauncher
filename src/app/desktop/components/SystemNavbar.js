import React, { useEffect, useState, memo } from 'react';
import { ipcRenderer } from 'electron';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWindowMinimize,
  faWindowMaximize,
  faWindowRestore,
  faTimes,
  faTerminal,
  faCog,
  faDownload
} from '@fortawesome/free-solid-svg-icons';
import { useSelector, useDispatch } from 'react-redux';
import { openModal } from '../../../common/reducers/modals/actions';
import {
  checkForPortableUpdates,
  updateUpdateAvailable,
  isAppLatestVersion
} from '../../../common/reducers/actions';
import BisectHosting from '../../../ui/BisectHosting';
import Logo from '../../../ui/Logo';

const SystemNavbar = () => {
  const dispatch = useDispatch();
  const [isMaximized, setIsMaximized] = useState(false);
  const isUpdateAvailable = useSelector(state => state.updateAvailable);
  const location = useSelector(state => state.router.location.pathname);

  const checkForUpdates = () => {
    if (
      process.env.REACT_APP_RELEASE_TYPE === 'setup' &&
      (process.platform !== 'linux' || process.env.APPIMAGE)
    ) {
      ipcRenderer.invoke('checkForUpdates');
      ipcRenderer.on('updateAvailable', () => {
        dispatch(updateUpdateAvailable(true));
      });
    } else if (
      process.platform === 'win32' &&
      process.env.REACT_APP_RELEASE_TYPE === 'portable'
    ) {
      dispatch(checkForPortableUpdates())
        .then(v => dispatch(updateUpdateAvailable(v)))
        .catch(console.error);
    } else {
      dispatch(isAppLatestVersion())
        .then(v => dispatch(updateUpdateAvailable(v)))
        .catch(console.error);
    }
  };

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

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') return;
    setTimeout(() => {
      console.log(process.env.REACT_APP_RELEASE_TYPE);
      checkForUpdates();
      setInterval(() => {
        checkForUpdates();
      }, 600000);
    }, 500);
  }, []);

  const openDevTools = () => {
    ipcRenderer.invoke('open-devtools');
  };

  const isOsx = process.platform === 'darwin';

  const isLinux = process.platform === 'linux';

  const DevtoolButton = () => (
    <TerminalButton
      css={`
        margin: 0 10px;
      `}
      onClick={openDevTools}
    >
      <FontAwesomeIcon icon={faTerminal} />
    </TerminalButton>
  );

  const SettingsButton = () => {
    const modals = useSelector(state => state.modals);

    const areSettingsOpen = modals.find(
      v => v.modalType === 'Settings' && !v.unmounting
    );
    return (
      <TerminalButton
        areSettingsOpen={areSettingsOpen}
        css={`
          margin: 0 20px 0 10px;
          ${props =>
            props.areSettingsOpen
              ? `background: ${props.theme.palette.grey[700]};`
              : null}
        `}
        onClick={() => {
          dispatch(openModal('Settings'));
        }}
      >
        <FontAwesomeIcon icon={faCog} />
      </TerminalButton>
    );
  };

  const UpdateButton = () => (
    <TerminalButton
      onClick={() => {
        if (!isLinux || process.env.APPIMAGE) {
          ipcRenderer.invoke('installUpdateAndQuitOrRestart');
        } else {
          dispatch(openModal('AutoUpdatesNotAvailable'));
        }
      }}
      css={`
        color: ${props => props.theme.palette.colors.green};
      `}
    >
      <FontAwesomeIcon icon={faDownload} />
    </TerminalButton>
  );
  const quitApp = () => {
    if (isUpdateAvailable && (!isLinux || process.env.APPIMAGE)) {
      ipcRenderer.invoke('installUpdateAndQuitOrRestart', true);
    } else {
      ipcRenderer.invoke('quit-app');
    }
  };

  const isLocation = loc => {
    if (loc === location) {
      return true;
    }
    return false;
  };

  return (
    <MainContainer>
      {!isOsx && (
        <>
          <div
            css={`
              cursor: auto !important;
              -webkit-app-region: drag;
              margin-left: 10px;
            `}
          >
            <a
              href="https://gdevs.io/"
              rel="noopener noreferrer"
              css={`
                margin-top: 5px;
              `}
            >
              <Logo size={35} pointerCursor />
            </a>
            <DevtoolButton />
          </div>
          <div
            css={`
              display: flex;
              height: 100%;
            `}
          >
            Partnered with &nbsp;&nbsp;
            <BisectHosting />
          </div>
        </>
      )}
      <Container os={isOsx}>
        {!isOsx ? (
          <>
            {isUpdateAvailable && <UpdateButton />}
            {!isLocation('/') && !isLocation('/onboarding') && (
              <SettingsButton />
            )}
            <div
              onClick={() => ipcRenderer.invoke('minimize-window')}
              css={`
                -webkit-app-region: no-drag;
              `}
            >
              <FontAwesomeIcon icon={faWindowMinimize} />
            </div>
            <div
              onClick={() => ipcRenderer.invoke('min-max-window')}
              css={`
                -webkit-app-region: no-drag;
              `}
            >
              <FontAwesomeIcon
                icon={isMaximized ? faWindowRestore : faWindowMaximize}
              />
            </div>
            <div
              css={`
                font-size: 18px;
                -webkit-app-region: no-drag;
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
                -webkit-app-region: no-drag;
              `}
              onClick={quitApp}
            >
              <FontAwesomeIcon icon={faTimes} />
            </div>
            <div
              onClick={() => ipcRenderer.invoke('min-max-window')}
              css={`
                -webkit-app-region: no-drag;
              `}
            >
              <FontAwesomeIcon
                icon={isMaximized ? faWindowRestore : faWindowMaximize}
              />
            </div>
            <div
              onClick={() => ipcRenderer.invoke('minimize-window')}
              css={`
                -webkit-app-region: no-drag;
              `}
            >
              <FontAwesomeIcon icon={faWindowMinimize} />
            </div>
            {!isLocation('/') && !isLocation('/onboarding') && (
              <SettingsButton />
            )}
            {isUpdateAvailable && <UpdateButton />}
          </>
        )}
      </Container>
      {isOsx && (
        <>
          <div
            css={`
              display: flex;
              height: 100%;
            `}
          >
            Partnered with &nbsp;&nbsp;
            <BisectHosting />
          </div>
          <div>
            <DevtoolButton />
            <a
              href="https://gdevs.io/"
              rel="noopener noreferrer"
              css={`
                margin-top: 5px;
              `}
            >
              <Logo size={35} pointerCursor />
            </a>
          </div>
        </>
      )}
    </MainContainer>
  );
};

export default memo(SystemNavbar);

const MainContainer = styled.div`
  width: 100%;
  height: ${({ theme }) => theme.sizes.height.systemNavbar}px;
  background: ${({ theme }) => theme.palette.grey[900]};
  -webkit-app-region: drag;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 100000;
  & > * {
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
  -webkit-app-region: drag;
  & > * {
    width: ${({ theme }) => theme.sizes.height.systemNavbar}px;
    height: 100%;
    display: flex;
    justify-content: center;
    cursor: pointer;
    align-items: center;
    &:hover {
      background: ${({ theme }) => theme.palette.grey[700]};
    }
    &:active {
      background: ${({ theme }) => theme.palette.grey[600]};
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
  display: flex;
  -webkit-app-region: no-drag;
  justify-content: center;
  cursor: pointer;
  align-items: center;
  width: ${({ theme }) => theme.sizes.height.systemNavbar}px;
  height: 100%;
  &:hover {
    background: ${({ theme }) => theme.palette.grey[700]};
  }
  &:active {
    background: ${({ theme }) => theme.palette.grey[600]};
  }
`;
