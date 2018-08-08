import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button } from 'antd';
import styles from './SideMenu.scss';
import MenuItem from '../MenuItem/MenuItem';

const SideMenu = () => {
  return (
    <div className={styles.container}>
      <div className={styles.sideMenuContainer}>
        <div className={styles.sideMenu}>
          <MenuItem>General</MenuItem>
          <MenuItem>Java</MenuItem>
          <MenuItem>Instances</MenuItem>
          <MenuItem>User Interface</MenuItem>
        </div>
      </div>
    </div>
  );
};

export default SideMenu;