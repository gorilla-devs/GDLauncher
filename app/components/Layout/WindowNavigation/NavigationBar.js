// @flow
import React, { Component } from 'react';
import { Menu, Icon } from 'antd';
import { Link } from 'react-router-dom';
import styles from './NavigationBar.css';
import WindowCloseBtn from '../../Buttons/WindowCloseButton/WindowCloseButton';

const { SubMenu, MenuItemGroup } = Menu;

type Props = {};
export default class NavigationBar extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className={styles.container}>
        GorillaDevs
        <Menu
          mode="horizontal"
          style={{
            WebkitAppRegion: 'no-drag',
            float: 'left',
            visibility: (this.props.location === '/login') || (this.props.location === '/')
              ? 'hidden' : 'visible'
          }}
          defaultSelectedKeys={['/home']}
          selectedKeys={[this.props.location]}
        >
          <Menu.Item key="/home">
            <Link to="/home" draggable="false"><Icon type="home" />Home</Link>
          </Menu.Item>
          <Menu.Item key="/profile">
            <Link to="/profile" draggable="false"><Icon type="profile" />My Profile</Link>
          </Menu.Item>
          <Menu.Item key="/dmanager">
            <Link to="/dmanager" draggable="false" ><Icon type="play-circle" />Packs</Link>
          </Menu.Item>
        </Menu>
        <WindowCloseBtn />
      </div>
    );
  }
}
