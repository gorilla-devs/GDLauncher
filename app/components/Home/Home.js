// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Select, Modal, Avatar, message } from 'antd';
import Card from '../Common/Card/Card';
import styles from './Home.scss';
import Dot from '../Common/Dot/Dot';
import Navigation from '../../containers/Navigation';
import SideBar from '../Common/SideBar/SideBar';
import supportBG from './images/Cemetery-Star-Trails_no-watermark.jpg';
import feedbacksBG from './images/1300767397-video-game-unicorn-minecraft-wallpaper-902057-wallpaper.jpg';
import avatarBG from './images/avatar_srshiropro_minecraft_by_srshiropro-d93jxg2.png';
import findJava from '../../utils/javaLocationFinder';

type Props = {
  +username: string
};

const discordModalStyle = {
  height: 500,
  backgroundColor: '#34495e',
  padding: 0,
  border: 0,
  overflow: 'hidden'
};

export default class Home extends Component<Props> {
  props: Props;
  /* eslint-disable */
  openLink(url) {
    require('electron').shell.openExternal(url)
  }


  /* eslint-enable */

  render() {
    return (
      <div>
        <main className={styles.content}>
          <span className={styles.title}>Welcome to GDLauncher!</span>
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
            { /* eslint-enable */}
          </div>
          <div className={styles.header__tiles}>
            <Link to="/dmanager" draggable="false" style={{ width: '40%' }}>
              <Card style={{
                background: '#2980b9'
              }}>
                <i className="fas fa-play" style={{ fontSize: '70px' }} />
                <h3>PLAY NOW!</h3>
              </Card>
            </Link>
            <a onClick={() => message.warning(<span>This page does not yet exist <i style={{ fontSize: '20px' }} class="fas fa-sad-tear"></i></span>)} draggable="false" style={{ width: '30%' }}>
              <Card style={{
                background: '#8e44ad'
              }}>
                <i className="fas fa-user-friends" style={{ fontSize: '70px' }} />
                <h3>FIND FRIENDS!</h3>
              </Card>
            </a>
            <Link to="/profile" draggable="false" style={{ width: '30%' }}>
              <Card style={{
                background: '#c0392b'
              }}>
                <Avatar style={{ height: '70px', width: '70px' }} src={avatarBG} />
                <h3>{this.props.username}</h3>
              </Card>
            </Link>
            <a target="_blank" rel="noopener noreferrer" href="https://github.com/gorilla-devs/GDLauncher/issues/new?template=feature_request.md" draggable="false" style={{ width: '100%' }}>
              <Card
                style={{
                  background: `linear-gradient( rgba(44, 62, 80, 0.4), rgba(44, 62, 80, 0.4)), url(${feedbacksBG}) center top`
                }}
                externalLink
              >
                <div style={{ marginTop: '30px' }}>
                  <span style={{
                    background: '#27ae60',
                    borderRadius: '5px',
                    padding: '10px',
                    fontSize: '20px',
                  }}
                  >
                    WE LOVE YOUR FEEDBACKS. SHARE YOUR IDEAS WITH US!
                  </span>
                </div>
              </Card>
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/gorilla-devs/GDLauncher/issues/new?template=bug_report.md"
              draggable="false"
              style={{
                width: '60%'
              }}
            >
              <Card
                style={{
                  background: `linear-gradient( rgba(44, 62, 80, 0.4), rgba(44, 62, 80, 0.4)), url(${supportBG})`
                }}
                externalLink
              >
                <i className="far fa-life-ring" style={{ fontSize: '70px' }} />
                <h3>SUPPORT</h3>
              </Card>
            </a>
            <Link to={{ pathname: '/discord', state: { modal: true } }} draggable="false" style={{ width: '40%' }}>
              <Card style={{
                background: '#7289da'
              }}>
                <i className="fab fa-discord" style={{ fontSize: '70px' }} />
                <h3>DISCOVER OUR DISCORD</h3>
              </Card>
            </Link>
          </div>
        </main>
      </div>
    );
  }
}
