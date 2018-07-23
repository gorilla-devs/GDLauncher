// @flow
import React, { Component } from 'react';
import { Button, Icon, Progress, message } from 'antd';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import styles from './DInstance.scss';
import launchCommand from '../../utils/MCLaunchCommand';

type Props = {
  name: string,
  installingQueue: Object,
  userData: Object,
  selectedInstance: string
};

export default class DInstance extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
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
    const util = require('util');
    const exec = util.promisify(require('child_process').exec);
    try {
      const name = await exec(await launchCommand(this.props.name, this.props.userData));
    } catch (error) {
      message.error("There was an error while starting the instance");
      console.error(error);
    }
  }

  handleClick = (e, data) => {
    console.log(data.foo);
  }

  render() {
    return (
      <div
        className={`${this.props.selectedInstance === this.props.name ? styles.selectedItem : ''} ${styles.main}`}
        onMouseEnter={() =>
          document.documentElement.style.setProperty('--instanceName', `"${this.props.name}"`)
        }
        onClick={() => this.props.selectInstanceNullable(this.props.name)}
      >
        <ContextMenuTrigger id={`contextMenu-${this.props.name}`}>
          <div>
            <div className={styles.icon}>
              <div
                className={styles.icon__image}
                style={{ filter: this.updateInstallingStatus() ? 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\'><filter id=\'grayscale\'><feColorMatrix type=\'matrix\' values=\'0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0\'/></filter></svg>#grayscale")' : '' }}
              />
              <span className={styles.icon_instanceName}>{this.props.name}</span>
              <Button className={styles.icon__playBtn} type="primary" onClick={this.handleClickPlay}>Play</Button>
            </div>
          </div >
        </ContextMenuTrigger>
        <ContextMenu id={`contextMenu-${this.props.name}`} onShow={() => this.props.selectInstance(this.props.name)}>
          <span>{this.props.name}</span>
          <MenuItem data={{ foo: 'bar' }} onClick={() => message.info('Managed')}>
            <i className="fas fa-wrench" style={{ marginRight: '8px' }} />
            Manage
          </MenuItem>
          <MenuItem data={{ foo: 'bar' }} onClick={() => message.info('Deleted')}>
            <i className="fas fa-trash-alt" style={{ marginRight: '8px' }} />
            Delete
          </MenuItem>
        </ContextMenu>
      </div>
    );
  }
}
