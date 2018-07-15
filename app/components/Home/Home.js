// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Select, Modal } from 'antd';
import Card from '../Common/Card/Card';
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
        <main className={styles.content}>
          <div className={styles.header}>
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
            {/* <h1 className={styles.title}>Welcome to GDLauncher!</h1>
            <h3 className={styles.subTitle}>Minecraft Made Easy</h3>
            <Link to="/dmanager" draggable="false">
              <Button type="primary" size="large" style={{ width: '300px', display: 'block', margin: '0 auto', height: '50px' }}>
                Play Now!
              </Button>
            </Link> */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', flexWrap: 'wrap' }}>
              <Link to="/dmanager" draggable="false" style={{ margin: '10px' }}>
                <Card style={{
                  width: '200px',
                  height: '200px',
                  textAlign: 'center',
                  background: 'rgb(46, 134, 222)'
                }}>
                  <i className="fas fa-play" style={{ fontSize: '70px' }} />
                  <h1>Play Now!</h1>
                </Card>
              </Link>
              <Link to="/dmanager" draggable="false" style={{ margin: '10px' }}>
                <Card style={{
                  width: '200px',
                  height: '200px',
                  textAlign: 'center',
                  background: 'rgb(255, 159, 67)'
                }}>
                  <i className="fas fa-play" style={{ fontSize: '70px' }} />
                  <h1>Play Now!</h1>
                </Card>
              </Link>
              <Link to="/dmanager" draggable="false" style={{ margin: '10px' }}>
                <Card style={{
                  width: '200px',
                  height: '200px',
                  textAlign: 'center',
                  background: 'rgb(238, 82, 83)'
                }}>
                  <i className="fas fa-play" style={{ fontSize: '70px' }} />
                  <h1>Play Now!</h1>
                </Card>
              </Link>
              <Link to="/dmanager" draggable="false" style={{ margin: '10px' }}>
                <Card style={{
                  width: '420px',
                  height: '200px',
                  textAlign: 'center',
                  background: 'rgb(16, 172, 132)'
                }}>
                  <i className="fas fa-play" style={{ fontSize: '70px' }} />
                  <h1>Play Now!</h1>
                </Card>
              </Link>
              <Link to="/dmanager" draggable="false" style={{ margin: '10px' }}>
                <Card style={{
                  width: '200px',
                  height: '200px',
                  textAlign: 'center',
                  background: 'rgba(155, 89, 182, 1)'
                }}>
                  <i className="fas fa-play" style={{ fontSize: '70px' }} />
                  <h1>Play Now!</h1>
                </Card>
              </Link>
            </div>
          </div>
          <div className={styles.status}>
            <span style={{ color: '#bdc3c7', fontSize: '25px' }}>Quick Launch</span>
            <div className={styles.header_status}>
              <div className={styles.status}>
                Instance 1 <br /><br />
                <i className="far fa-check-circle" style={{ color: '#27ae60', fontSize: '90px' }} />
              </div>
              <div className={styles.status}>
                Server 1 <br /><br />
                <i className="far fa-check-circle" style={{ color: '#27ae60', fontSize: '90px' }} />
              </div>
              <div className={styles.status}>
                Instance 2 <br /><br />
                <i className="far fa-check-circle" style={{ color: '#27ae60', fontSize: '90px' }} />
              </div>
              <div className={styles.status}>
                Server 2 <br /><br />
                <i className="far fa-check-circle" style={{ color: '#27ae60', fontSize: '90px' }} />
              </div>
            </div>
          </div>
          <div className={styles.flexbox1}>
            <h3 className={styles.subTitle} style={{ padding: '55px' }}>One Launcher To Rule Them All</h3>
          </div>
          <br />
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

          <Button
            type="primary"
            style={{ width: '300px', margin: '200px auto 70px auto', height: '100px', display: 'block', clear: 'both' }}
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
        </main>
      </div>
    );
  }
}
