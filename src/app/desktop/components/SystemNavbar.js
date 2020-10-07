import React, { useEffect, useState, memo } from 'react';
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
  getAppLatestVersion
} from '../../../common/reducers/actions';
import BisectHosting from '../../../ui/BisectHosting';
import Logo from '../../../ui/Logo';
import sendMessage, { handleMessage } from '../../../common/utils/sendMessage';
import EV from '../../../common/messageEvents';

const isDev = process.env.NODE_ENV === 'development';
const SystemNavbar = () => {
  const dispatch = useDispatch();
  const [isMaximized, setIsMaximized] = useState(false);
  const isUpdateAvailable = useSelector(state => state.updateAvailable);
  const location = useSelector(state => state.router.location.pathname);
  const [isAppImage, setIsAppImage] = useState(false);

  const modals = useSelector(state => state.modals);

  const areSettingsOpen = modals.find(
    v => v.modalType === 'Settings' && !v.unmounting
  );

  const checkForUpdates = async () => {
    if (isDev) return;
    const isAppImageVar = await sendMessage(EV.IS_APP_IMAGE);
    setIsAppImage(isAppImageVar);
    if (
      process.env.REACT_APP_RELEASE_TYPE === 'setup' &&
      (isAppImageVar || process.platform === 'win32')
    ) {
      sendMessage(EV.CHECK_FOR_UPDATES);
      handleMessage(EV.UPDATE_AVAILABLE, () => {
        dispatch(updateUpdateAvailable(true));
      });
    } else if (
      process.platform === 'win32' &&
      process.env.REACT_APP_RELEASE_TYPE === 'portable'
    ) {
      dispatch(checkForPortableUpdates())
        .then(v => dispatch(updateUpdateAvailable(Boolean(v))))
        .catch(console.error);
    } else {
      dispatch(getAppLatestVersion())
        .then(v => dispatch(updateUpdateAvailable(Boolean(v))))
        .catch(console.error);
    }
  };

  useEffect(() => {
    sendMessage(EV.IS_MAIN_WINDOW_MAXIMIZED)
      .then(setIsMaximized)
      .catch(console.error);
    handleMessage(EV.MAIN_WINDOW_MAXIMIZED, () => {
      setIsMaximized(true);
    });
    handleMessage(EV.MAIN_WINDOW_MINIMIZED, () => {
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
    }, 1500);
  }, []);

  const openDevTools = () => {
    sendMessage(EV.OPEN_MAIN_WINDOW_DEVTOOLS);
  };

  const isOsx = process.platform === 'darwin';
  const isLinux = process.platform === 'linux';
  const isWindows = process.platform === 'win32';

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

  const SettingsButton = () => (
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

  const UpdateButton = () => (
    <TerminalButton
      onClick={() => {
        if (isAppImage || isWindows) {
          sendMessage(EV.APPLY_UPDATE);
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
    if (isUpdateAvailable && (isAppImage || !isLinux)) {
      sendMessage(EV.APPLY_UPDATE, true);
    } else {
      sendMessage(EV.QUIT_APP);
    }
  };

  const isLocation = loc => {
    if (loc === location) {
      return true;
    }
    return false;
  };

  return (
    <MainContainer
      onDoubleClick={() => {
        if (process.platform === 'darwin') {
          sendMessage(EV.MINMAX_MAIN_WINDOW);
        }
      }}
    >
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
                -webkit-app-region: no-drag;
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
            <BisectHosting
              showPointerCursor
              onClick={() => dispatch(openModal('BisectHosting'))}
            />
            {/* <PulsatingCircle /> */}
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
              onClick={() => sendMessage(EV.MINIMIZE_MAIN_WINDOW)}
              css={`
                -webkit-app-region: no-drag;
              `}
            >
              <FontAwesomeIcon icon={faWindowMinimize} />
            </div>
            <div
              onClick={() => sendMessage(EV.MINMAX_MAIN_WINDOW)}
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
              onClick={() => sendMessage(EV.MINMAX_MAIN_WINDOW)}
              css={`
                -webkit-app-region: no-drag;
              `}
            >
              <FontAwesomeIcon
                icon={isMaximized ? faWindowRestore : faWindowMaximize}
              />
            </div>
            <div
              onClick={() => sendMessage(EV.MINIMIZE_MAIN_WINDOW)}
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
            <BisectHosting
              showPointerCursor
              onClick={() => dispatch(openModal('BisectHosting'))}
            />
            {/* <PulsatingCircle /> */}
          </div>
          <div>
            <DevtoolButton />
            <a
              href="https://gdevs.io/"
              rel="noopener noreferrer"
              css={`
                margin-top: 5px;
                -webkit-app-region: no-drag;
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

// const opacityPulse = keyframes`
//  0% {
//     -webkit-box-shadow: 0 0 0 0 rgba(39, 174, 96, 0.4);
//  }
//  70% {
//     -webkit-box-shadow: 0 0 0 10px rgba(39, 174, 96, 0);
//  }
//  100% {
//     -webkit-box-shadow: 0 0 0 0 rgba(39, 174, 96, 0);
//  }
// `;
// const PulsingCircleInner = styled.div`
//   animation: ${opacityPulse} 1s ease-out;
//   animation-delay: ${props => props.delay};
//   animation-iteration-count: infinite;
//   background: ${props => props.theme.palette.colors.green};
//   opacity: ${props => props.opacity || 1};
//   border-radius: 50%;
//   height: ${props => props.height};
//   width: ${props => props.width};
//   position: absolute;
//   display: inline-block;
//   text-align: center;
// `;
// const PulsingCircleContainer = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   position: relative;
//   margin-left: 1rem;
//   margin-right: 1.5rem;
//   top: -1px;
// `;

// function PulsatingCircle() {
//   return (
//     <PulsingCircleContainer>
//       <PulsingCircleInner delay="0s" height="17px" width="17px" opacity={0.1} />
//       <PulsingCircleInner
//         delay="0.5s"
//         height="12.75"
//         width="12.75"
//         opacity={0.15}
//       />
//       <PulsingCircleInner delay="1s" height="8.5px" width="8.5px" />
//     </PulsingCircleContainer>
//   );
// }
