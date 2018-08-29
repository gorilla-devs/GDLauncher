import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button } from 'antd';
import styles from './SideMenu.scss';
import MenuItem from '../MenuItem/MenuItem';

const SideMenu = ({ match }) => {
  return (
    <div className={styles.container}>
      <div className={styles.sideMenuContainer}>
        <div className={styles.sideMenu}>
          <MenuItem active={match.params.page === 'myAccount'} to="myAccount">My Account</MenuItem>
          <MenuItem active={match.params.page === 'java'} to="java">Java</MenuItem>
          <MenuItem active={match.params.page === 'instances'} to="instances">Instances</MenuItem>
          <MenuItem active={match.params.page === 'ui'} to="ui">User Interface</MenuItem>
        </div>
      </div>
    </div>
  );
};

export default SideMenu;