// @flow
import React, { Component } from 'react';
import { Menu, Icon } from 'antd';
import { Link } from 'react-router-dom';
import styles from './SystemNavBar.css';
import HorizontalMenu from '../HorizontalMenu/HorizontalMenu';
import WindowCloseBtn from '../WindowCloseButton/WindowCloseButton';
import WindowMinimizeBtn from '../WindowMinimizeButton/WindowMinimizeButton';
import WindowHideBtn from '../WindowHideButton/WindowHideButton';


type Props = {};
export default class SystemNavBar extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className={styles.container}>
        <WindowCloseBtn />
        <WindowMinimizeBtn />
        <WindowHideBtn />
      </div>
    );
  }
}
