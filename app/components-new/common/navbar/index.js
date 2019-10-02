// @flow
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog,
  faHome,
  faThList,
  faAlignJustify
} from '@fortawesome/free-solid-svg-icons';
import logo from 'app/assets/images/logo.png';
import {
  Container,
  SettingsButton,
  UpdateButton,
  NavigationContainer,
  NavigationElement
} from './style';
import { Button } from 'ui';
import { openModal } from 'reducers/modals/actions';

export default props => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const location = useSelector(state => state.router.location.pathname);
  const dispatch = useDispatch();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      ipcRenderer.send('check-for-updates');
      ipcRenderer.on('update-available', () => {
        setUpdateAvailable(true);
      });
    }
  }, []);

  const isLocation = loc => {
    if (loc === location) {
      return true;
    }
    return false;
  };

  return (
    <Container style={{ background: 'red' }}>
      <img
        src={logo}
        height="30px"
        alt="logo"
        draggable="false"
        style={{ zIndex: 1 }}
      />
      <NavigationContainer>
        <NavigationElement>
          <Link to="/home" draggable="false">
            <Button selected={isLocation('/home')}>Home</Button>
          </Link>
        </NavigationElement>
        <NavigationElement>
          <Link to="/modpacks" draggable="false">
            <Button selected={isLocation('/modpacks')}>ModPacks</Button>
          </Link>
        </NavigationElement>
      </NavigationContainer>
      <SettingsButton>
        <FontAwesomeIcon
          icon={faCog}
          onClick={() => dispatch(openModal('Settings'))}
        />
        <FontAwesomeIcon
          icon={faAlignJustify}
          onClick={() => dispatch(openModal('Changelog'))}
        />
      </SettingsButton>
      {updateAvailable && (
        <UpdateButton>
          <Link to="/autoUpdate">
            <Button type="primary" size="small" style={{ marginLeft: 5 }}>
              Update Available
            </Button>
          </Link>
        </UpdateButton>
      )}
    </Container>
  );
};
