// @flow
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Input, Button } from 'antd';
import { Link } from 'react-router-dom';
import { promisify } from 'util';
import fs from 'fs';
import styles from './ServerManager.scss';
import { downloadFile } from '../../utils/downloader';



function DownloadServer() {
  
}

function ServerManager(props) {
  const [servers, setServers] = useState(["sergio", "peppe"]);

  return (
    <div className={styles.container}>
      <div className={styles.serverSettings}>
      </div>
      <div className={styles.Serverlist}>

        {servers.length > 0 &&
          servers.map(name => (
            <div className={styles.server1}><h1>{name}</h1>
              <Button type="primary" icon="download" onClick={DownloadServer} ></Button>
            </div>
          ))}

      </div>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    versionsManifest: state.packCreator.versionsManifest
  };
}

function mapDispatchToProps() {

}

export default connect(mapStateToProps, mapDispatchToProps)(ServerManager);