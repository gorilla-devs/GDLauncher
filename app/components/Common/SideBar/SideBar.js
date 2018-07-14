// @flow
import React, { Component } from 'react';
import { Menu, Card, Dropdown, Avatar, Icon, Tooltip, Modal, Button, Badge, Popover, List, Progress } from 'antd';
import { Redirect, Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import styles from './SideBar.css';

import * as AuthActions from '../../../actions/auth';
import * as ProfileActions from '../../../actions/profile';
import * as downloadManagerActions from '../../../actions/downloadManager';

import DownloadManager from '../../DownloadManager/DownloadManager';
import Settings from '../../Settings/Settings';


type Props = {
};

const { Meta } = Card;

class SideBar extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      AccountIconsModalisOpen: false,
      downloadPopoverOpen: false,
    };

    this.logout = this.logout.bind(this);
    this.openAccountIconsModal = this.openAccountIconsModal.bind(this);
    this.closeAccountIconsModal = this.closeAccountIconsModal.bind(this);

  }

  hide = () => {
    this.setState({
      downloadPopoverOpen: false,
    });
  }
  handleVisibleChange = (downloadPopoverOpen) => {
    this.setState({ downloadPopoverOpen });
  }

  logout() {
    this.props.logout();
  }

  openAccountIconsModal() {
    this.setState({ AccountIconsModalisOpen: true });
  }

  closeAccountIconsModal() {
    this.setState({ AccountIconsModalisOpen: false });
  }

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
        <Card
          style={{ color: '#34495e', border: 0, width: 200 }}
          actions={[
            <Link to={{
              pathname: '/settings',
              state: { modal: true }
            }}
            >
              <Icon
                type="setting"
                style={{ fontSize: 22, color: 'rgba(255, 255, 255, 0.65)' }}
              />
            </Link>,
            <DownloadManager
              downloadQueue={this.props.downloadQueue}
              open={this.state.downloadPopoverOpen}
              handleOpen={this.handleVisibleChange}
            />
          ]}
        >
          <Meta
            avatar={
              <Tooltip placement="topLeft" title="Change Account Icon">
                <Avatar style={{ cursor: 'pointer' }} size="large" onClick={this.openAccountIconsModal}>P</Avatar>
              </Tooltip>
            }
            title={
              <span>
                {this.props.username}
              </span>
            }
            description={
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
                <Tooltip placement="topLeft" title="Logout">
                  <Icon type="logout" style={{ cursor: 'pointer', float: 'right', marginTop: '4px', color: 'white' }} onClick={this.logout} />
                </Tooltip>
              </div>
            }
          />
        </Card>
        <Modal
          visible={this.state.AccountIconsModalisOpen}
          footer={null}
          title="Account Icon"
          onCancel={this.closeAccountIconsModal}
          destroyOnClose="true"
        >
          <Avatar size="large" style={{ cursor: 'pointer', margin: 15 }}>P</Avatar>
          <Avatar size="large" style={{ cursor: 'pointer', margin: 15 }}>P</Avatar>
          <Avatar size="large" style={{ cursor: 'pointer', margin: 15 }}>P</Avatar>
          <Avatar size="large" style={{ cursor: 'pointer', margin: 15 }}>P</Avatar>
          <Avatar size="large" style={{ cursor: 'pointer', margin: 15 }}>P</Avatar>
          <Avatar size="large" style={{ cursor: 'pointer', margin: 15 }}>P</Avatar>
          <Avatar size="large" style={{ cursor: 'pointer', margin: 15 }}>P</Avatar>
          <Avatar size="large" style={{ cursor: 'pointer', margin: 15 }}>P</Avatar>
          <Avatar size="large" style={{ cursor: 'pointer', margin: 15 }}>P</Avatar>
          <Avatar size="large" style={{ cursor: 'pointer', margin: 15 }}>P</Avatar>
          <Avatar size="large" style={{ cursor: 'pointer', margin: 15 }}>P</Avatar>
          <Avatar size="large" style={{ cursor: 'pointer', margin: 15 }}>P</Avatar>
          <Avatar size="large" style={{ cursor: 'pointer', margin: 15 }}>P</Avatar>
          <Avatar size="large" style={{ cursor: 'pointer', margin: 15 }}>P</Avatar>
          <Avatar size="large" style={{ cursor: 'pointer', margin: 15 }}>P</Avatar>
        </Modal>
      </aside>
    );
  }
}

function mapStateToProps(state) {
  return {
    username: state.auth.username,
    profileState: state.profile.profileState,
    stateColor: state.profile.stateColor,
    downloadQueue: state.downloadManager.downloadQueue
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...AuthActions, ...ProfileActions }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SideBar);
