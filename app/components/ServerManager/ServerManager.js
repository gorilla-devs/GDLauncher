// @flow
import React, { Component } from 'react';
import { Input, Button } from 'antd';
import { Link } from 'react-router-dom';
import { promisify } from 'util';
import fs from 'fs';
import styles from './ServerManager.scss';

type Props = {};

export default class ServerManager  extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.serverSettings}></div>
        <div className={styles.Serverlist}></div>
      </div>
    );
  }
}
