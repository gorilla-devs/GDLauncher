import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { message, Button } from 'antd';
import path from 'path';
import log from 'electron-log';
import { Link } from 'react-router-dom';
import { go } from 'connected-react-router';
import fs from 'fs';
import fsa from 'fs-extra';
import { promisify } from 'util';
import Modal from '../Common/Modal/Modal';
import { PACKS_PATH, SERVERS_PATH } from '../../constants';
import styles from './serverCommandsModal.scss';

type Props = {};





function ServerCommandsModal(props) {
  const [unMount, setUnMount] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { name, type } = props.match.params;


  useEffect(() => {
    players("list");

  }, []);


  function dbClick() {

  }

  async function writeToWritable(writable, data) {
    console.log("DATA", data);
  
    await writable.write(data);
  }
  
  async function runCommand(command) {
    console.log(command);
    try {
      let paramL = `/${command}\n`;
      await writeToWritable(props.start.stdin, paramL);
  
      // start.stdout.on("data", (data) => {
      //   console.log(data.toString());
      // });
      // start.stderr.on("data", (data) => {
      //   console.log(data.toString());
      // });
    } catch{
  
    }
  }

  function players(list) {
    runCommand(list);
    props.start.stdout.on("data", (data) => {
      console.log(data.toString());
    });
  }

  return (
    <Modal
      history={props.history}
      unMount={unMount}
      title={`Users`}
      style={{ height: 300, width: 500 }}
    >
      <div className={styles.content}>

        <div className={styles.player}>PROVA</div>
        <div className={styles.player}>PROVA</div>
        <div className={styles.player}>PROVA</div>
        <div className={styles.player}>PROVA</div>
        <div className={styles.player} onDoubleClick={() => dbClick()} >PROVA</div>

      </div>
      <Button type="primary" className={styles.button}></Button>
    </Modal>
  );
};

function mapStateToProps(state) {
  return {
    versionsManifest: state.packCreator.versionsManifest,
    packName: state.serverManager.packName, //testare
    start: state.serverManager.process
  };
}

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(ServerCommandsModal);