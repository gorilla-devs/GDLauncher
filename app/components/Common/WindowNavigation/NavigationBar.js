// @flow
import React, { Component } from 'react';
import { Menu, Icon } from 'antd';
import { Link } from 'react-router-dom';
import styles from './NavigationBar.css';
import HorizontalMenu from '../HorizontalMenu/HorizontalMenu';


type Props = {};
export default class NavigationBar extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.logoText}>
          <i className="fab fa-gofore" />
        </div>
        <HorizontalMenu location={this.props.location} />
      </div>
    );
  }
}
