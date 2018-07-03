// @flow
import React, { Component } from 'react';
import { Menu, Icon } from 'antd';
import { Link } from 'react-router-dom';
import styles from './NavigationBar.css';
import HorizontalMenu from '../HorizontalMenu/HorizontalMenu';
import WindowCloseBtn from '../WindowCloseButton/WindowCloseButton';
import WindowMinimizeBtn from '../WindowMinimizeButton/WindowMinimizeButton';
import WindowHideBtn from '../WindowHideButton/WindowHideButton';


type Props = {};
export default class NavigationBar extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.logoText}>
          GorillaDevs
        </div>
        {this.props.location !== '/' && <HorizontalMenu location={this.props.location} />}
        <WindowCloseBtn />
        <WindowMinimizeBtn />
        <WindowHideBtn />
      </div>
    );
  }
}
