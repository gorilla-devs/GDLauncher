import React, { useEffect, useState } from 'react';
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

const SystemNavbar = () => {
  const dispatch = useDispatch();
  const [isMaximized, setIsMaximized] = useState(false);
  const isUpdateAvailable = useSelector(state => state.updateAvailable);
  const location = useSelector(state => state.router.location.pathname);

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
      if (process.env.REACT_APP_RELEASE_TYPE === 'setup') {
        // Check every 10 minutes
        ipcRenderer.invoke('checkForUpdates');
        ipcRenderer.on('updateAvailable', () => {
          dispatch(updateUpdateAvailable(true));
        });
      } else if (process.platform !== 'linux') {
        dispatch(checkForPortableUpdates())
          .then(v => dispatch(updateUpdateAvailable(v)))
          .catch(console.error);
      } else {
        dispatch(isAppLatestVersion())
          .then(v => dispatch(updateUpdateAvailable(v)))
          .catch(console.error);
      }

      setInterval(() => {
        if (process.env.REACT_APP_RELEASE_TYPE === 'setup') {
          ipcRenderer.invoke('checkForUpdates');
        } else if (process.platform !== 'linux') {
          dispatch(checkForPortableUpdates())
            .then(v => dispatch(updateUpdateAvailable(v)))
            .catch(console.error);
        } else {
          dispatch(isAppLatestVersion())
            .then(v => dispatch(updateUpdateAvailable(v)))
            .catch(console.error);
        }
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
        if (!isLinux) {
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
    if (isUpdateAvailable && process.env.NODE_ENV !== 'development') {
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
        <div
          css={`
            cursor: auto !important;
            -webkit-app-region: drag;
          `}
        >
          {/* <a href="https://gdevs.io/" rel="noopener noreferrer">
            <img
              src={logo}
              height="30px"
              alt="logo"
              draggable="false"
              css={`
                z-index: 1;
                cursor: pointer;
                margin-left: 8px;
              `}
            />
          </a> */}
          <DevtoolButton />
        </div>
      )}
      {/* <div
        css={`
          height: 100%;
          cursor: auto !important;
        `}
      >
        Sponsored by
        <img
          src="EHEHEHHEH"
          alt="Eheheh"
          css={`
            height: 100%;
            transition: all 0.1s ease-in-out;
            padding: 0 10px;
          `}
        />
      </div> */}
      <Container os={isOsx}>
        {!isOsx ? (
          <>
            {isUpdateAvailable && <UpdateButton />}
            {!isLocation('/') && !isLocation('/onboarding') && (
              <SettingsButton />
            )}
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
            <div onClick={() => ipcRenderer.invoke('min-max-window')}>
              <FontAwesomeIcon
                icon={isMaximized ? faWindowRestore : faWindowMaximize}
              />
            </div>
            <div onClick={() => ipcRenderer.invoke('minimize-window')}>
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
        <div>
          <DevtoolButton />
          {/* <a href="https://gdevs.io/" rel="noopener noreferrer">
            <img
              src={logo}
              height="30px"
              alt="logo"
              draggable="false"
              css={`
                z-index: 1;
                cursor: pointer;
                margin-right: 8px;
              `}
            />
          </a> */}
        </div>
      )}
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
  position: relative;
  z-index: 100000;
  & > * {
    -webkit-app-region: no-drag;
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
    -webkit-app-region: no-drag;
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
