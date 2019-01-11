// @flow
import React, { Component } from 'react';
import { Menu, Icon } from 'antd';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Badge from '../../../Badge/Badge';
import styles from './HorizontalMenu.scss';
import logo from '../../../../../assets/images/logo.png';

type Props = {};
export default class NavigationBar extends Component<Props> {
  props: Props;

  isLocation = loc => {
    if (loc === this.props.location) {
      return true;
    }
    return false;
  };

  render() {
    return (
      <div className={styles.main}>
        <ul className={styles.ul}>
          <li className={`${styles.li} ${this.isLocation('/home') ? styles.activeLink : null}`}>
            <Link
              to="/home"
              draggable="false"
              className={styles.a}
            >
              <FontAwesomeIcon icon="home" className={styles.i} />
              HOME
            </Link>
          </li>
          <li className={`${styles.li} ${this.isLocation('/dmanager') ? styles.activeLink : null}`}>
            <Link
              to="/dmanager"
              draggable="false"
              className={styles.a}
            >
              <FontAwesomeIcon icon="play" className={styles.i} />
              INSTANCES
            </Link>
          </li>
          <li className={`${styles.li} ${this.isLocation('/curseModpacksBrowser') ? styles.activeLink : null}`}>
            <Link
              to="/curseModpacksBrowser"
              draggable="false"
              className={styles.a}
            >
              <FontAwesomeIcon icon="th-list" className={styles.i} />
              MODPACKS
            </Link>
          </li>
          <li className={styles.li}>
            <Link
              to="/serverManager"
              draggable="false"
              className={`${styles.a} ${
                this.isLocation('/serverManager') ? styles.activeLink : null
              }`}
            >
              <Icon type="database" className={styles.i} />
              SERVERS
            </Link>
          </li>
        </ul>
      </div>
    );
  }
}
