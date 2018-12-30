// @flow
import React, { useState } from 'react';
import { Input, Button } from 'antd';
import { Link } from 'react-router-dom';
import { promisify } from 'util';
import fs from 'fs';
import styles from './ServerManager.scss';

type Props = {};

export default function ServerManager(props) {
  const [servers, setServers] = useState(["peppe", "peppe", "peppe","peppe"]);


  return (
    <div className={styles.container}>
      <div className={styles.serverSettings}>
      </div>
      <div className={styles.Serverlist}>

        {servers.length > 0 &&
          servers.map(name => (
            <div className={styles.server1}><h1>{name}</h1></div>
          ))}

      </div>
    </div>
  );
}
