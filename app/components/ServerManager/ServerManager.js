// @flow
import React, { Component } from 'react';
import { Input, Button } from 'antd';
import { Link } from 'react-router-dom';
import { promisify } from 'util';
import fs from 'fs';
import styles from './ServerManager.scss';

type Props = {};

export default class ServerManager extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.server} />
        <div className={styles.list}>
          <div className={styles.list1} />
          <div className={styles.list2} />
          <div className={styles.list3} />
          <div className={styles.list4} />
        </div>
      </div>
    );
  }
}
