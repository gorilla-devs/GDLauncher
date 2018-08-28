// @flow
import React, { Component } from 'react';
import { Menu, Icon } from 'antd';
import { Link } from 'react-router-dom';
import Badge from '../../../Badge/Badge';
import styles from './HorizontalMenu.css';

type Props = {};
export default class NavigationBar extends Component<Props> {
  props: Props;

  activeItem = {
    background: '#3498db',
    borderRadius: '4px',
    color: 'white'
  }

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
            <Link to="/home" draggable="false" className={styles.a} style={this.isLocation('/home') ? this.activeItem : null}>
              <Icon type="home" className={styles.i} />
              HOME
            </Link>
          </li>
          <li className={styles.li}>
            <Link to="/profile" draggable="false" className={styles.a} style={this.isLocation('/profile') ? this.activeItem : null}>
              <Icon type="profile" className={styles.i} />
              PROFILE
            </Link>
          </li>
          <li className={styles.li}>
            <Link to="/dmanager" draggable="false" className={styles.a} onClick={() => this.props.clearQueue()} style={this.isLocation('/dmanager') ? this.activeItem : null}>
              <Badge count={this.props.downloadingCount} invisible={this.props.downloadingCount === 0}>
                <Icon type="play-circle" className={styles.i} />
                INSTANCES
              </Badge>
            </Link>
          </li>
        </ul>
      </div>
    );
  }
}
