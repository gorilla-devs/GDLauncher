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



function addServer() {

}

function DownloadServer() {

}

function ServerManager(props) {
  const [servers, setServers] = useState(["server1"]);

  return (
    <div className={styles.container}>
      <div className={styles.serverSettings}>
      </div>
      <div className={styles.Serverlist}>

        {servers.length > 0 &&
          servers.map(name => (
            <div key={name} className={styles.server}><h1>{name}</h1>
              <Button type="primary" icon="play" onClick={DownloadServer}>
                Download
                </Button>
            </div>))}


        <Link
          to={{
            pathname: '/ServerCreatorModal',
            state: { modal: true }
          }}
        >
          <Button icon="plus" className={styles.AddButton} onClick={addServer}>
            Add Server
        </Button>
        </Link>
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