// @flow
import React, { Component } from 'react';
import { Button, Icon } from 'antd';
import styles from './DManager.css';
import VanillaModal from '../../containers/VanillaModal';
import DIcon from '../DIcon/DIcon';

type Props = {};

export default class DManager extends Component<Props> {
  props: Props;
  constructor() {
    super();
    this.state = {
      vanillaModalIsOpen: false
    };

    this.openVanillaModal = this.openVanillaModal.bind(this);
    this.closeVanillaModal = this.closeVanillaModal.bind(this);
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


  /* eslint-enable */

  render() {
    return (
      <div>
        <div className={styles.background_image} />
        <div className={styles.background_overlay} />
        <main className={styles.main}>
          <button onClick={this.openVanillaModal}>Open</button>
          {Object.values(this.props.installingQueue).map((element) => {
            return (<DIcon
              name={element.name}
              installing={
                (() => {
                  switch (element.status) {
                    case 'Queued':
                      return true;
                    case 'Downloading':
                      return true;
                    case 'Completed':
                      return false;
                    default:
                      return true;
                  }
                })()
              }
              percentage={element.totalToDownload !== 0 ? Math.floor((element.downloaded * 100) / element.totalToDownload) : 0}
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
