// @flow
import React, { Component } from 'react';
import { Menu, Card, Dropdown, Avatar, Icon, Tooltip, Modal, Button, Badge, Popover, List, Progress } from 'antd';
import { Redirect, Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import styles from './SideBar.scss';

import * as AuthActions from '../../../actions/auth';
import * as ProfileActions from '../../../actions/profile';


type Props = {
};

class SideBar extends Component<Props> {
  props: Props;

  handleClick = (e) => {
    console.log(e);
    switch (e.key) {
      case 'Online':
        this.props.setStateToOnline();
        break;
      case 'Away':
        this.props.setStateToAway();
        break;
      case 'Busy':
        this.props.setStateToBusy();
        break;
      default:
        this.props.setStateToOnline();
        break;
    }
  }

  render() {
    return (
      <aside className={styles.sidenav}>
        <div className={styles.header}>
          <Tooltip placement="topLeft" title="Change Account Icon">
            <Avatar size="normal" onClick={this.openAccountIconsModal}>P</Avatar>
          </Tooltip>
          <span>{this.props.username}</span>
          <div className={styles.headerButtons}>
            <Link to={{
              pathname: '/settings',
              state: { modal: true }
            }}
            >
              <i
                className={`fas fa-cog ${styles.settings}`}
                draggable="false"
              />
            </Link>
            <Tooltip placement="topLeft" title="Logout">
              <i className={`fas fa-sign-out-alt ${styles.logout}`} onClick={this.props.logout} />
            </Tooltip>
          </div>
        </div>
        <div>
          <Dropdown overlay={
            <Menu selectedKeys={[this.props.profileState]} onClick={this.handleClick}>
              <Menu.Item key="Online" style={{ color: '#2ecc71' }}>
                Online
                    </Menu.Item>
              <Menu.Item key="Away" style={{ color: '#faad14' }}>
                Away
                    </Menu.Item>
              <Menu.Item key="Busy" style={{ color: '#f5222d' }}>
                Busy
                    </Menu.Item>
            </Menu>
          }>
            <span style={{ color: this.props.stateColor, cursor: 'pointer' }}>{this.props.profileState} <Icon type="down" /></span>
          </Dropdown>
        </div>
        <div className={styles.socialsContainer}>
          { /* eslint-disable */}
          <img
            alt="socials"
            draggable="false"
            style={{ padding: 10 }}
            className={styles.socialBtn}
            src="https://discordapp.com/assets/a39ef972d8ec7966a6a25b1853b14f38.svg"
            onClick={() => this.openLink("https://twitter.com/gorilladevs")}
          />
          <img
            alt="socials"
            draggable="false"
            style={{ padding: 10 }}
            className={styles.socialBtn}
            src="https://discordapp.com/assets/47ee7342b7e2986c314fd77f4331df63.svg"
            onClick={() => this.openLink("https://facebook.com/gorilladevs")}
          />
          <img
            alt="socials"
            draggable="false"
            style={{ padding: 10 }}
            className={styles.socialBtn}
            src="https://discordapp.com/assets/97e19ce71e9c9273e01d64da1948912b.svg"
            onClick={() => this.openLink("https://instagram.com/gorilladevs")}
          />
          <span className={styles.version}>v{require('../../../package.json').version}</span>
          { /* eslint-enable */}
        </div>
      </aside>
    );
  }
}

function mapStateToProps(state) {
  return {
    username: state.auth.displayName,
    profileState: state.profile.profileState,
    stateColor: state.profile.stateColor,
    downloadQueue: state.downloadManager.downloadQueue
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...AuthActions, ...ProfileActions }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SideBar);
