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
  constructor(props){
    super(props);
    this.state={
      serverName: ["peppe", "peppe", "peppe","peppe"]
    };
  }


  render() {
    return (
      <div className={styles.container}>
        <div className={styles.serverSettings}>
        
        </div>
        <div className={styles.Serverlist}>

          {this.state.serverName.length > 0 &&
            this.state.serverName.map(name => (
            <div className={styles.server1}><h1>{name.value}</h1></div>
          ))}

        </div>
      </div>
    );
  }
}
