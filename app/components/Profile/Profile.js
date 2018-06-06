import React, { Component } from 'react';
import { Button, Card, Select, Modal, Icon, Progress } from 'antd';
import SideBar from '../Layout/SideBar/SideBar';
import styles from './Profile.css';

export default class Profile extends Component<Props> {
  props: Props;

  render() {
    return (
      <div>
        <div className={styles.background_image} />
        <div className={styles.background_overlay} />
        <main className={styles.content}>
          <SideBar />
          <div className={styles.mainText}>
            <span style={{ fontFamily: 'Gotham', fontSize: 50 }}>
              {this.props.username}
            </span>
            <span style={{ fontSize: 30, marginLeft: 60 }}>
              <Progress type="circle" percent={78} format={percent => `LV. 39`} />
            </span>
          </div>
          <div className={styles.hours}>
            <Icon type="clock-circle-o" style={{ paddingRight: 5 }} /> 341 total hours played
          </div>
          <div className={styles.skin}>
            <img src="assets/images/skin.png" alt="skin" />
          </div>
        </main>
      </div>
    );
  }
}
