// @flow
import React, { useEffect, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { ipcRenderer } from 'electron';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faDownload } from '@fortawesome/free-solid-svg-icons';
import logo from '../../../common/assets/logo.png';
import { openModal } from '../../../common/reducers/modals/actions';
import {
  updateUpdateAvailable,
  checkForPortableUpdates
} from '../../../common/reducers/actions';

export const Container = styled.div`
  width: 100vw;
  height: ${({ theme }) => theme.sizes.height.navbar}px;
  -webkit-user-select: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  div {
    display: flex;
  }
`;

export const SettingsButton = styled.div`
  font-size: 22px;
  color: white;
  cursor: pointer;
  align-items: center;
  margin-right: ${({ theme }) => theme.spacing(3)}px;
  transition: all 0.2s ease-in-out;
  &:hover {
    color: white;
    transition: all 0.2s ease-in-out;
  }
  path {
    cursor: pointer;
  }
  path:hover {
    color: white;
    transition: all 0.2s ease-in-out;
  }
`;

export const UpdateButton = styled.div`
  z-index: 10;
  cursor: pointer;
  align-items: center;
  margin-right: ${({ theme }) => theme.spacing(5)}px;
  font-size: 22px;
  color: ${props => props.theme.palette.colors.green};
  path {
    cursor: pointer;
  }
`;

const Navbar = () => {
  const updateAvailable = useSelector(state => state.updateAvailable);
  const location = useSelector(state => state.router.location.pathname);
  const dispatch = useDispatch();

  useEffect(() => {
    setTimeout(() => {
      console.log(process.env.REACT_APP_RELEASE_TYPE);
      if (process.env.REACT_APP_RELEASE_TYPE === 'setup') {
        // Check every 10 minutes
        ipcRenderer.invoke('checkForUpdates');
        ipcRenderer.on('updateAvailable', () => {
          dispatch(updateUpdateAvailable(true));
        });
      } else {
        dispatch(checkForPortableUpdates())
          .then(v => dispatch(updateUpdateAvailable(v)))
          .catch(console.error);
      }

      setInterval(() => {
        if (process.env.REACT_APP_RELEASE_TYPE === 'setup') {
          ipcRenderer.invoke('checkForUpdates');
        } else {
          checkForPortableUpdates()
            .then(val => dispatch(updateUpdateAvailable(val)))
            .catch(console.error);
        }
      }, 600000);
    }, 500);
  }, []);

  const isLocation = loc => {
    if (loc === location) {
      return true;
    }
    return false;
  };

  if (isLocation('/') || isLocation('/onboarding')) return null;
  return (
    <Container>
      <a href="https://gdevs.io/" rel="noopener noreferrer">
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
      </a>
      <div>
        {updateAvailable && (
          <UpdateButton
            onClick={() => {
              ipcRenderer.invoke('installUpdateAndQuitOrRestart');
            }}
          >
            <FontAwesomeIcon icon={faDownload} />
          </UpdateButton>
        )}
        <SettingsButton>
          <FontAwesomeIcon
            icon={faCog}
            onClick={() => dispatch(openModal('Settings'))}
          />
        </SettingsButton>
      </div>
    </Container>
  );
};

export default memo(Navbar);
