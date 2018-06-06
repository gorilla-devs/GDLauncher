// @flow
import React, { Component } from 'react';
import { Button, Icon } from 'antd';
import styles from './DManager.css';
import SideBar from '../../Layout/SideBar/SideBar';
import VanillaModal from '../../../containers/VanillaModal';

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
      // this.props.downloadPack(packName);
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
        <main className={styles.content}>
          <SideBar />
          <div className={styles.mainText}>
            <div style={{ height: 120, width: 120 }}>
              <img src="https://glixyl.files.wordpress.com/2015/04/revenge-icon.png" alt="pack" width="120" height="120" />
            </div>
          </div>
          <div className={styles.actions}>
            <Button
              type="primary"
              style={{ height: 160, width: 160, margin: 20, textAlign: 'center', paddingTop: 20 }}
              onClick={this.openVanillaModal}
            >
              Vanilla
              <Icon type="plus" style={{ fontSize: 70, display: 'block', marginTop: 20 }} />
            </Button>
            <Button disabled type="primary" style={{ height: 160, width: 160, margin: 20, textAlign: 'center', paddingTop: 20 }}>
              Forge Stock
              <Icon type="plus" style={{ fontSize: 70, display: 'block', marginTop: 20 }} />
            </Button>
            <Button disabled type="primary" style={{ height: 160, width: 160, margin: 20, textAlign: 'center', paddingTop: 20 }}>
              Modpacks
              <Icon type="plus" style={{ fontSize: 70, display: 'block', marginTop: 20 }} />
            </Button>
          </div>
        </main>
        {this.state.vanillaModalIsOpen && <VanillaModal
          visible={this.state.vanillaModalIsOpen}
          closeModal={this.closeVanillaModal}
        />}
      </div>
    );
  }
}
