// @flow
import React, { Component } from 'react';
import { Button, Icon } from 'antd';
import { lstatSync, readdirSync, watch, existsSync } from 'fs';
import { join, basename } from 'path';
import mkdirp from 'mkdirp';
import styles from './DManager.css';
import VanillaModal from '../../containers/VanillaModal';
import DIcon from '../DIcon/DIcon';
import { LAUNCHER_FOLDER, PACKS_FOLDER_NAME } from '../../constants';
import store from '../../localStore';

type Props = {};
let watcher;

export default class DManager extends Component<Props> {
  props: Props;
  constructor() {
    super();
    if (!existsSync(`${LAUNCHER_FOLDER}/${PACKS_FOLDER_NAME}`)) {
      mkdirp.sync(`${LAUNCHER_FOLDER}/${PACKS_FOLDER_NAME}`);
    }
    this.state = {
      vanillaModalIsOpen: false,
      instances: this.getDirectories(`${LAUNCHER_FOLDER}/${PACKS_FOLDER_NAME}`)
    };
    // Watches for any changes in the packs dir. TODO: Optimize
    watcher = watch(`${LAUNCHER_FOLDER}/${PACKS_FOLDER_NAME}`, () => {
      if (!existsSync(`${LAUNCHER_FOLDER}/${PACKS_FOLDER_NAME}`)) {
        mkdirp.sync(`${LAUNCHER_FOLDER}/${PACKS_FOLDER_NAME}`);
      }
      this.setState({
        instances: this.getDirectories(`${LAUNCHER_FOLDER}/${PACKS_FOLDER_NAME}`)
      });
    });

    this.openVanillaModal = this.openVanillaModal.bind(this);
    this.closeVanillaModal = this.closeVanillaModal.bind(this);
  }

  componentWillUnmount() {
    // Stop watching for changes when this component will unmount
    watcher.close();
  }

  openVanillaModal() {
    this.setState({ vanillaModalIsOpen: true });
  }

  closeVanillaModal(download = null, packName) {
    this.setState({ vanillaModalIsOpen: false });
    if (download === true) {
      this.props.addToQueue(packName, 'vanilla');
    }
  }
  /* eslint-disable */
  openLink(url) {
    require('electron').shell.openExternal(url)
  }

  isDirectory = source => lstatSync(source).isDirectory();
  getDirectories = source => readdirSync(source)
    .map(name => join(source, name))
    .filter(this.isDirectory)
    .map(dir => basename(dir));


  /* eslint-enable */

  render() {
    return (
      <div>
        <div className={styles.background_image} />
        <div className={styles.background_overlay} />
        <main className={styles.main}>
          <button onClick={this.openVanillaModal}>Open</button>
          {this.state.instances.map((element) => {
            return (<DIcon
              name={element}
              key={element}
              installing={
                (() => {
                  if (this.props.installingQueue[element]) {
                    switch (this.props.installingQueue[element].status) {
                      case 'Queued':
                        return true;
                      case 'Downloading':
                        return true;
                      case 'Completed':
                        return false;
                      default:
                        return true;
                    }
                  } else {
                    return false;
                  }
                })()
              }
              percentage={
                (() => {
                  if (this.props.installingQueue[element]) {
                    switch (this.props.installingQueue[element].status) {
                      case 'Queued':
                        return 0;
                      case 'Downloading':
                        /* TODO: Fix NaN. It is caused by 0 / 0 division while waiting for usable data from the worker */
                        return Math.floor(
                          (this.props.installingQueue[element].downloaded * 100)
                          / this.props.installingQueue[element].totalToDownload);
                      case 'Completed':
                        return 100;
                      default:
                        return 0;
                    }
                  } else {
                    return 0;
                  }
                })()
              }
            />);
          })}
        </main>
        {this.state.vanillaModalIsOpen && <VanillaModal
          visible={this.state.vanillaModalIsOpen}
          closeModal={this.closeVanillaModal}
        />}
      </div>
    );
  }
}
