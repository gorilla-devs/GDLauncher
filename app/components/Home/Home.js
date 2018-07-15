// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Select, Modal, Avatar } from 'antd';
import Card from '../Common/Card/Card';
import styles from './Home.scss';
import Dot from '../Common/Dot/Dot';
import Navigation from '../../containers/Navigation';
import SideBar from '../Common/SideBar/SideBar';

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
          <div className={styles.header}>
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
              <Link to="/dmanager" draggable="false" style={{ width: '60%' }}>
                <Card style={{
                  background: '#2980b9'
                }}>
                  <i className="fas fa-play" style={{ fontSize: '70px' }} />
                  <h2>Play Now!</h2>
                </Card>
              </Link>
              <Link to="/dmanager" draggable="false" style={{ width: '20%' }}>
                <Card style={{
                  background: '#8e44ad'
                }}>
                  <i className="fas fa-user-friends" style={{ fontSize: '70px' }} />
                  <h2>Find Friends!</h2>
                </Card>
              </Link>
              <Link to="/profile" draggable="false" style={{ width: '20%' }}>
                <Card style={{
                  background: '#c0392b'
                }}>
                  <Avatar style={{ height: '70px', width: '70px' }} src="https://orig00.deviantart.net/9ffa/f/2015/212/e/e/avatar_srshiropro_minecraft_by_srshiropro-d93jxg2.png" />
                  <h2>{this.props.username}</h2>
                </Card>
              </Link>
              <a onClick={() => this.openLink("https://github.com/gorilla-devs/GDLauncher/issues/new?template=feature_request.md")} draggable="false" style={{ width: '100%' }}>
                <Card style={{
                  background: 'linear-gradient( rgba(44, 62, 80, 0.4), rgba(44, 62, 80, 0.4)), url("http://2.bp.blogspot.com/-eZE8WKQt-4I/UBe7ih5E58I/AAAAAAAAAMA/s5NMaq2qcMI/s1600/1300767397-video-game-unicorn-minecraft-wallpaper-902057-wallpaper.jpg") center top'
                }}>
                  <div style={{ marginTop: '30px' }}>
                    <span style={{
                      background: '#27ae60',
                      borderRadius: '5px',
                      padding: '10px',
                      fontSize: '20px',
                    }}>WE LOVE YOUR FEEDBACKS. SHARE YOUR IDEAS WITH US!
                  </span>
                  </div>
                </Card>
              </a>
              <a
                onClick={() => this.openLink("https://github.com/gorilla-devs/GDLauncher/issues/new?template=bug_report.md")}
                draggable="false"
                style={{
                  width: '60%'
                }}
              >
                <Card style={{
                  background: 'linear-gradient( rgba(44, 62, 80, 0.4), rgba(44, 62, 80, 0.4)), url("https://improvephotography.com/wp-content/uploads/2014/08/Cemetery-Star-Trails_no-watermark.jpg")'
                }}>
                  <i className="far fa-life-ring" style={{ fontSize: '70px' }} />
                  <h2>Support</h2>
                </Card>
              </a>
              <Link to={{ pathname: '/discord', state: { modal: true } }} draggable="false" style={{ width: '40%' }}>
                <Card style={{
                  background: '#7289da'
                }}>
                  <i className="fab fa-discord" style={{ fontSize: '70px' }} />
                  <h2>Discover our Discord</h2>
                </Card>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }
}
