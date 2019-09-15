// @flow
import React, { useState, useEffect } from 'react';
import { Menu, Icon, Button } from 'antd';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faPlay, faThList } from '@fortawesome/free-solid-svg-icons';
import Badge from '../../../../../components/Common/Badge/Badge';
import styles from './HorizontalMenu.scss';
import logo from '../../../../../assets/images/logo.png';

export default props => {
  const isLocation = loc => {
    if (loc === props.location) {
      return true;
    }
    return false;
  };

  return (
    <div className={styles.main}>
      <ul className={styles.ul}>
        <li
          className={`${styles.li} ${
            isLocation('/home') ? styles.activeLink : null
          }`}
        >
          <Link to="/home" draggable="false" className={styles.a}>
            <FontAwesomeIcon icon={faHome} className={styles.i} />
            HOME
          </Link>
        </li>
        <li
          className={`${styles.li} ${
            isLocation('/modpacks') ? styles.activeLink : null
          }`}
        >
          <Link to="/modpacks" draggable="false" className={styles.a}>
            <FontAwesomeIcon icon={faThList} className={styles.i} />
            MODPACKS
          </Link>
        </li>
      </ul>
    </div>
  );
};
