// @flow
import React, { Component } from 'react';
import { Menu, Icon } from 'antd';
import { Link } from 'react-router-dom';
import styles from './NavigationBar.css';
import HorizontalMenu from './components/HorizontalMenu/HorizontalMenu';
import logo from '../../../assets/images/logo.png';


type Props = {};
export default class NavigationBar extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.logoText}>
          <img src={logo} height="47.6px" alt="logo" />
        </div>
        <HorizontalMenu location={this.props.location} />
      </div>
    );
  }
}
