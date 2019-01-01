// @flow
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Input, Button } from 'antd';
import { Link } from 'react-router-dom';
import { promisify } from 'util';
import fs from 'fs';
import styles from './ServerManager.scss';
import { downloadFile } from '../../utils/downloader';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';



function DownloadServer() {

}

function ServerManager(props) {
  const [servers, setServers] = useState(["sergio", "peppe", "peppe", "peppe", "peppe"]);

  return (
    <div className={styles.container}>
      <div className={styles.serverSettings}>
      </div>
      <div className={styles.Serverlist}>

        {servers.length > 0 &&
          servers.map(name => (
            <div key={name} className={styles.server1}><h1>{name}</h1>
              <Link
                to={{
                  pathname: '/ServerCreatorModal',
                  state: { modal: true }
                }}
              >
                <Button type="primary" icon="plus" onClick={DownloadServer}>
                  Download
                </Button>
              </Link>
            </div>
          ))}
          
      <Button icon="plus" className={styles.AddButton}>
       Add Server
      </Button>
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
  return ({

  })
}

export default connect(mapStateToProps, mapDispatchToProps)(ServerManager);