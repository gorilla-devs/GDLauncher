import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button } from 'antd';
import styles from './SideMenu.scss';
import MenuItem from './MenuItem/MenuItem';

const SideMenu = (props) => {
  return (
    <div className={styles.container}>
      <div className={styles.sideMenuContainer}>
        <div className={styles.sideMenu}>
          {props.children}
        </div>
      </div>
    </div>
  );
};

export default SideMenu;