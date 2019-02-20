// @flow
import React, { useState, useEffect } from 'react';
import { Menu, Button } from 'antd';
import { Link } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './NavigationBar.scss';
import HorizontalMenu from './components/HorizontalMenu/HorizontalMenu';
import * as downloadManagerActions from '../../../actions/downloadManager';
import logo from '../../../assets/images/logo.png';

export default props => {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      ipcRenderer.send('check-for-updates');
      ipcRenderer.on('update-available', () => {
        setUpdateAvailable(true);
      });
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.logoText}>
        <img src={logo} height="40px" alt="logo" draggable="false" />
      </div>
      <HorizontalMenu location={props.location} />
      <Link
        to={{
          pathname: '/settings/myAccount_Preferences',
          state: { modal: true }
        }}
      >
        <FontAwesomeIcon icon="cog" className={styles.settings} />
      </Link>
      {updateAvailable && (
        <div className={styles.updateAvailable}>
          <Link to="/autoUpdate">
            <Button type="primary" size="small" style={{ marginLeft: 5 }}>
              Update Available
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};
