// @flow
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faHome, faThList } from '@fortawesome/free-solid-svg-icons';
import logo from '../../../assets/images/logo.png';
import {
  Container,
  // Logo,
  SettingsButton,
  UpdateButton,
  NavigationContainer,
  NavigationElement
} from './style';
import { Button } from 'ui';

export default props => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const location = useSelector(state => state.router.location.pathname);

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
        style={{ zIndex: 9999999999999 }}
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
        {/* <ul>
          <NavigationElement selected={isLocation('/home')}>
            <Link to="/home" draggable="false">
              Home
            </Link>
          </NavigationElement>
          <NavigationElement selected={isLocation('/modpacks')}>
            <Link to="/modpacks" draggable="false">
              ModPacks
            </Link>
          </NavigationElement>
        </ul> */}
      </NavigationContainer>
      <SettingsButton>
        <Link
          to={{
            pathname: '/settings/myAccount_Preferences',
            state: { modal: true }
          }}
        >
          <FontAwesomeIcon icon={faCog} />
        </Link>
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
