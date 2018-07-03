// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Select, Modal } from 'antd';
import styles from './Home.css';
import Dot from '../Common/Dot/Dot';
import Navigation from '../../containers/Navigation';
import SideBar from '../Common/SideBar/SideBar';

type Props = {};

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
        <div className={styles.background_image} />
        <div className={styles.background_overlay} />
        <main className={styles.content}>
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
          <h1 className={styles.title}>Welcome to GDLauncher!</h1>
          <h3 className={styles.subTitle}>Minecraft Made Easy</h3>
          <div className={styles.topDots}>
            <div className={styles.dotContainer}>
              <Dot Color="#27ae60"> Connect with Friends and Join Them </Dot>
            </div>
            <div className={styles.dotContainer}>
              <Dot Color="#2980b9"> Manage Your Game Instances </Dot>
            </div>
            <div className={styles.dotContainer}>
              <Dot Color="#f39c12"> Create and Manage Local Servers </Dot>
            </div>
          </div>
          <div className={styles.topBtn}>
            <Button type="primary" size="large" style={{ width: '25vw', margin: 15, height: '4vw' }}>Find Friends</Button>
            <Link to="/dmanager" draggable="false">
              <Button type="primary" size="large" style={{ width: '25vw', margin: 15, height: '4vw' }}>
                Play
              </Button>
            </Link>
          </div>
          <div className={styles.botBtn}>
            <Button
              type="primary"
              style={{ width: '25vw', margin: 15, height: '10vw' }}
              size="large"
            >
              <Link to={{ pathname: '/discord', state: { modal: true } }}>
                <img
                  src="https://discordapp.com/assets/35d75407bd75d70e84e945c9f879bab8.svg"
                  draggable="false"
                  alt="discord"
                  style={{ cursor: 'pointer', marginTop: 10 }}
                />
              </Link>
            </Button>
          </div>
          <div className={styles.botDots}>
            <div className={styles.dotContainer}>
              <Dot Color="#d35400"> Join Our Community </Dot>
            </div>
            <div className={styles.dotContainer}>
              <Dot Color="#16a085"> Find New Friends </Dot>
            </div>
            <div className={styles.dotContainer}>
              <Dot Color="#8e44ad"> Get in Touch with Us </Dot>
            </div>
          </div>
        </main>
      </div>
    );
  }
}
