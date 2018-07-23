// @flow
import React, { Component } from 'react';
import { Button, Icon, Progress, message } from 'antd';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import fsa from 'fs-extra';
import { hideMenu } from 'react-contextmenu/src/actions';
import { LAUNCHER_FOLDER, PACKS_FOLDER_NAME } from '../../constants';
import styles from './DInstance.scss';

type Props = {
  name: string,
  installingQueue: Object,
  selectedInstance: string
};

export default class DInstance extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      deleting: false
    }
    this.percentage = this.updatePercentage();
  }

  componentDidUpdate = (prevProps, prevState) => {
    this.percentage = this.updatePercentage();
  }

  updateInstallingStatus() {
    if (this.props.installingQueue[this.props.name]) {
      switch (this.props.installingQueue[this.props.name].status) {
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
  }

  updatePercentage() {
    if (this.props.installingQueue[this.props.name]) {
      switch (this.props.installingQueue[this.props.name].status) {
        case 'Queued':
          return 0;
        case 'Downloading':
          /* TODO: Fix NaN. It is caused by 0 / 0 division while waiting for usable data from the worker */
          return Math.floor(
            (this.props.installingQueue[this.props.name].downloaded * 100)
            / this.props.installingQueue[this.props.name].totalToDownload);
        case 'Completed':
          return 100;
        default:
          return 0;
      }
    } else {
      return 0;
    }
  }

  handleClickPlay = async (e) => {
    e.stopPropagation();
    this.props.startInstance(this.props.name);
  }

  handleClick = (e, data) => {
    console.log(data.foo);
  }

  deleteInstance = async () => {
    try {
      await fsa.remove(`${LAUNCHER_FOLDER}/${PACKS_FOLDER_NAME}/${this.props.name}`);
      hideMenu();
      message.success('Instance deleted');
    } catch (err) {
      hideMenu();
      message.error('Error deleting instance');
      console.error(err);
    }
  }

  render() {
    return (
      <div
        className={`${this.props.selectedInstance === this.props.name ? styles.selectedItem : ''} ${styles.main}`}
        onMouseEnter={() =>
          document.documentElement.style.setProperty('--instanceName', `"${this.props.name}"`)
        }
        onClick={(e) => { e.stopPropagation(); this.props.selectInstance(this.props.name) }}
      >
        <ContextMenuTrigger id={`contextMenu-${this.props.name}`}>
          {this.props.playing.find(el => el === this.props.name) &&
            <span className={styles.playingIcon}><i className="fas fa-play" style={{ fontSize: '17px' }} /></span>}
          {this.updateInstallingStatus() &&
            <span className={styles.downloadingIcon}><i className="fas fa-download" style={{ fontSize: '17px' }} /></span>}
          <div className={styles.icon}>
            <div
              className={styles.icon__image}
              style={{ filter: this.updateInstallingStatus() ? 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\'><filter id=\'grayscale\'><feColorMatrix type=\'matrix\' values=\'0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0\'/></filter></svg>#grayscale")' : '' }}
            />
            <span className={styles.icon__instanceNameContainer}>
              <span className={styles.icon__instanceName} style={{ width: this.updateInstallingStatus() ? '76px' : '130px' }}>
                {this.props.name}
              </span>
              <span className={styles.icon__instancePercentage}>
                {this.updateInstallingStatus() && ` (${this.updatePercentage()}%)`}
              </span>
            </span>
          </div>
        </ContextMenuTrigger>
        <ContextMenu id={`contextMenu-${this.props.name}`} onShow={(e) => { e.stopPropagation(); this.props.selectInstance(this.props.name) }}>
          <span>{this.props.name}</span>
          <MenuItem data={{ foo: 'bar' }} onClick={this.handleClickPlay}>
            <i className="fas fa-play" style={{ marginRight: '8px' }} />
            Play
          </MenuItem>
          <MenuItem data={{ foo: 'bar' }} onClick={() => message.info('Managed')}>
            <i className="fas fa-wrench" style={{ marginRight: '8px' }} />
            Manage
          </MenuItem>
          <MenuItem data={{ foo: 'bar' }} onClick={this.deleteInstance} preventClose>
            <i className="fas fa-trash-alt" style={{ marginRight: '8px' }} />
            {this.state.deleting ? 'Deleting...' : 'Delete'}
          </MenuItem>
        </ContextMenu>
      </div >
    );
  }
}
