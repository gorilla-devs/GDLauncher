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
  constructor() {
    super();
    this.state = {
      modalIsOpen: false
    };

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  openModal() {
    this.setState({ modalIsOpen: true });
  }

  closeModal() {
    this.setState({ modalIsOpen: false });
  }
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
            <Button type="primary" size="large" style={{ width: 250, margin: 15 }}>Find Friends</Button>
            <Link to="/dmanager" draggable="false">
              <Button type="primary" size="large" style={{ width: 250, margin: 15 }}>
                Play
              </Button>
            </Link>
          </div>
          <div className={styles.botBtn}>
            <Button
              type="primary"
              style={{ width: 250, margin: 15, height: 90 }}
              size="large"
              onClick={this.openModal}
            >
              <img
                src="https://discordapp.com/assets/35d75407bd75d70e84e945c9f879bab8.svg"
                draggable="false"
                alt="discord"
                style={{ cursor: 'pointer', marginTop: 10 }}
              />
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
        <Modal
          bodyStyle={discordModalStyle}
          visible={this.state.modalIsOpen}
          footer={null}
          onCancel={this.closeModal}
          title="Our Discord"
          destroyOnClose="true"
        >
          {!this.state.waitForDiscord && <iframe
            title="discordwidget"
            src="https://discordapp.com/widget?id=398091532881756161&theme=dark"
            width="520"
            height="500"
            allowTransparency="true"
            frameBorder="0"
          />}
        </Modal>
      </div>
    );
  }
}
