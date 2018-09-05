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
          <Button loading={this.props.updating} onClick={this.props.update} type="primary" size="small" style={{ marginLeft: 5 }}>
            <a href={`https://github.com/gorilla-devs/GDLauncher/releases/tag/v${this.props.latestVersion}`} target="_blank" rel="noopener noreferrer">
              Update Available ({this.props.latestVersion})
              </a>
          </Button>
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
          <a href="https://twitter.com/gorilladevs" target="_blank" rel="noopener noreferrer" className={styles.socialBtn}>
            <i className="fab fa-twitter" />
          </a>
          <a href="https://facebook.com/gorilladevs" target="_blank" rel="noopener noreferrer" className={styles.socialBtn}>
            <i className="fab fa-facebook"
            />
          </a>
          <a href="https://instagram.com/gorilladevs" target="_blank" rel="noopener noreferrer" className={styles.socialBtn}>
            <i className="fab fa-instagram"
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
    latestVersion: state.autoUpdater.latestVersion,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...AuthActions, ...ProfileActions, ...autoUpdater }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SideBar);
