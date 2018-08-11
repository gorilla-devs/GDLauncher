// @flow
import React, { Component } from 'react';
import { Avatar } from 'antd';
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
          <Avatar size="normal">P</Avatar>
          <span>{this.props.username}</span>
          <div onClick={() => this.props.logout()}>
            <i className={`fas fa-sign-out-alt ${styles.logout}`} />
          </div>
        </div>
        <div style={{ textAlign: 'center', fontWeight: 'italic', fontSize: 12 }}>
          <span>Playing on</span> <b style={{ fontStyle: 'italic', fontWeight: '900', fontSize: 13, color: '#2ecc71', cursor: 'pointer' }}>AnonymousCraft</b>
        </div>
        <hr />
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
    downloadQueue: state.downloadManager.downloadQueue
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...AuthActions, ...ProfileActions }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SideBar);
