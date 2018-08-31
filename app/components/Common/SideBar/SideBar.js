// @flow
import React, { Component } from 'react';
import { Avatar, Button, Popover } from 'antd';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import CIcon from '../../Common/Icon/Icon';

import styles from './SideBar.scss';

import * as AuthActions from '../../../actions/auth';
import * as ProfileActions from '../../../actions/profile';
import * as autoUpdater from '../../../actions/autoUpdater';


type Props = {
};

class SideBar extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      updateTextVisible: true
    }
    this.props.checkForUpdates();
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
        {this.props.updateAvailable && <div className={styles.updateAvailable}>
          <Button loading={this.props.updating} onClick={this.props.update} type="primary" size="small" style={{ marginLeft: 5 }}>Update Available</Button>
        </div>}
        <div className={styles.header}>
          <span>
            <CIcon size={32}>
              {this.props.username && this.props.username.charAt(0).toUpperCase()}
            </CIcon>
          </span>
          <span>{this.props.username}</span>
          <div onClick={() => this.props.logout()}>
            <i className={`fas fa-sign-out-alt ${styles.logout}`} />
          </div>
        </div>
        <div style={{ textAlign: 'center', fontWeight: 'italic', fontSize: 12 }}>
          <span>Playing on</span>   <Popover placement="left" title="Title">
            <b className={styles.playingServer} style={{ fontStyle: 'italic', fontWeight: '900', fontSize: 13, cursor: 'pointer' }}>AnonymousCraft</b>
          </Popover>
        </div>
        <hr />
        <div className={styles.socialsContainer}>
          { /* eslint-disable */}
          <a href="https://twitter.com/gorilladevs" target="_blank" rel="noopener noreferrer">
            <img
              alt="socials"
              draggable="false"
              style={{ padding: 10 }}
              className={styles.socialBtn}
              src="https://discordapp.com/assets/a39ef972d8ec7966a6a25b1853b14f38.svg"
            />
          </a>
          <a href="https://facebook.com/gorilladevs" target="_blank" rel="noopener noreferrer">
            <img
              alt="socials"
              draggable="false"
              style={{ padding: 10 }}
              className={styles.socialBtn}
              src="https://discordapp.com/assets/47ee7342b7e2986c314fd77f4331df63.svg"
            />
          </a>
          <a href="https://instagram.com/gorilladevs" target="_blank" rel="noopener noreferrer">
            <img
              alt="socials"
              draggable="false"
              style={{ padding: 10 }}
              className={styles.socialBtn}
              src="https://discordapp.com/assets/97e19ce71e9c9273e01d64da1948912b.svg"
            />
          </a>
          <span className={styles.version}>v{require('../../../package.json').version}</span>
          { /* eslint-enable */}
        </div>
        <div className={styles.scroller}>
          <div style={{ height: 1000 }}>
            Socials
          </div>
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
    downloadQueue: state.downloadManager.downloadQueue,
    updateAvailable: state.autoUpdater.updateAvailable,
    updating: state.autoUpdater.checkingForUpdates,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...AuthActions, ...ProfileActions, ...autoUpdater }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SideBar);
