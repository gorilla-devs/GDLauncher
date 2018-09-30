// @flow
import React, { Component } from 'react';
import { Menu, Icon } from 'antd';
import { Link } from 'react-router-dom';
import Badge from '../../../Badge/Badge';
import styles from './HorizontalMenu.scss';

type Props = {};
export default class NavigationBar extends Component<Props> {
  props: Props;

  isLocation = (loc) => {
    if (loc === this.props.location) {
      return true;
    }
    return false;
  };

  render() {
    return (
      <div className={styles.main}>
        <ul className={styles.ul}>
          <li className={styles.li}>
            <Link to="/home" draggable="false" className={`${styles.a} ${this.isLocation('/home') ? styles.activeLink : null}`}>
              <Icon type="home" theme="filled" className={styles.i} />
              HOME
            </Link>
          </li>
          <li className={styles.li}>
            <Link to="/dmanager" draggable="false" className={`${styles.a} ${this.isLocation('/dmanager') ? styles.activeLink : null}`}>
              <Badge count={this.props.downloadingCount} invisible={this.props.downloadingCount === 0}>
                <Icon type="play-circle" theme="filled" className={styles.i} />
                INSTANCES
              </Badge>
            </Link>
          </li>
          <li className={styles.li}>
            <Link to="/serverManager" draggable="false" className={`${styles.a} ${this.isLocation('/serverManager') ? styles.activeLink : null}`}>
              <Icon type="database" className={styles.i} />
              SERVERS
            </Link>
            </li>
        </ul>
      </div>
    );
  }
}
