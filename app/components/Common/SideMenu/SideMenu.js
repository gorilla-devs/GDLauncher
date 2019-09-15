import React from 'react';
import { Button } from 'antd';
import styles from './SideMenu.scss';
import MenuItem from './MenuItem/MenuItem';

const SideMenu = props => {
  return (
    <div className={styles.container} style={props.style || null}>
      <div className={styles.sideMenuContainer}>
        <div className={styles.sideMenu}>{props.children}</div>
      </div>
    </div>
  );
};

export default SideMenu;
