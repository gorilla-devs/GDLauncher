// @flow
import React, { Component } from 'react';
import { message, Icon, Tooltip } from 'antd';
import psTree from 'ps-tree';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import fsa from 'fs-extra';
import path from 'path';
import fs from 'fs';
import os from 'os';
import log from 'electron-log';
import { promisify } from 'util';
import { exec } from 'child_process';
import { hideMenu } from 'react-contextmenu/es6/actions';
import { PACKS_PATH, APPPATH } from '../../constants';
import { history } from '../../store/configureStore';
import styles from './DInstance.scss';

type Props = {
  name: string,
  installingQueue: object,
  selectedInstance: ?string,
  startInstance: () => void,
  selectInstance: () => void,
  playing: array
};

export default class DInstance extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      deleting: false,
      version: null,
      isValid: true,
      forgeVersion: null
    };
  }

  componentDidMount = async () => {
    const { name } = this.props;
    if (!this.isInstalling()) {
      try {
        const { version, forgeVersion } = JSON.parse(
          await promisify(fs.readFile)(
            path.join(PACKS_PATH, name, 'config.json')
          )
        );
        this.setState({
          version,
          forgeVersion: forgeVersion.split('-')[1]
        });
      } catch (e) {
        this.setState({
          version: 'Error',
          isValid: false
        });
      }
    }
  };

  componentDidUpdate = () => {
    this.percentage = this.updatePercentage();
  };

  isInstalling = () => {
    const { name, installingQueue } = this.props;
    if (installingQueue[name]) {
      switch (installingQueue[name].status) {
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
  };

  updatePercentage = () => {
    const { name, installingQueue } = this.props;
    const { percentage } = installingQueue[name] || 0;
    if (installingQueue[name]) {
      switch (installingQueue[name].status) {
        case 'Queued':
          return 0;
        case 'Downloading':
          // If the total file to download is equal to 0 (not yet sent from the worker) then show 0 to avoid NaN from 0 / 0
          return percentage;
        case 'Completed':
          return 100;
        default:
          return 0;
      }
    } else {
      return 0;
    }
  };

  handleClickPlay = async e => {
    const { startInstance, selectInstance, name, playing } = this.props;
    const { isValid } = this.state;
    if (!this.isInstalling()) {
      e.stopPropagation();
      if (playing.find(el => el.name === name) && isValid) {
        psTree(playing.find(el => el.name === name).pid, (err, children) => {
          children.forEach(el => {
            process.kill(el.PID);
          });
        });
        message.info('Instance terminated');
      } else {
        startInstance(name);
        selectInstance(name);
      }
    }
  };

  deleteInstance = async () => {
    const { name, selectInstance } = this.props;
    try {
      this.setState({ deleting: true });
      await fsa.remove(path.join(PACKS_PATH, name));
      selectInstance(null);
      message.success('Instance deleted');
    } catch (err) {
      message.error('Error deleting instance');
      log.error(err);
    } finally {
      this.setState({ deleting: false });
      hideMenu(`contextMenu-${name}`);
    }
  };

  render = () => {
    const { name, selectedInstance, selectInstance, playing } = this.props;
    const { version, isValid, deleting, forgeVersion } = this.state;
    return (
      <div
        className={`${selectedInstance === name ? styles.selectedItem : ''} ${
          styles.main
          }`}
      >
        <ContextMenuTrigger id={`contextMenu-${name}`}>
          <div
            className={styles.innerMain}
            onMouseEnter={() =>
              document.documentElement.style.setProperty(
                '--instanceName',
                `"${name}"`
              )
            }
            onClick={e => {
              e.stopPropagation();
              selectInstance(name);
            }}
            onDoubleClick={this.handleClickPlay}
            onKeyPress={this.handleKeyPress}
            role="button"
            tabIndex={0}
          >
            {playing.find(el => el.name === name) && (
              <span className={styles.playingIcon}>
                <i className="fas fa-play" style={{ fontSize: '17px' }} />
              </span>
            )}
            {this.isInstalling() && (
              <Icon
                className={styles.icon__iconState}
                type="loading"
                theme="outlined"
              />
            )}
            {!isValid && (
              <Tooltip title="Warning: this instance is corrupted.">
                <Icon
                  className={styles.warningIcon}
                  type="warning"
                  theme="outlined"
                />
              </Tooltip>
            )}
            <div className={styles.icon}>
              <div
                className={styles.icon__image}
                style={{
                  filter: this.isInstalling()
                    ? "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'><filter id='grayscale'><feColorMatrix type='matrix' values='0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0'/></filter></svg>#grayscale\")"
                    : ''
                }}
              />
              <span className={styles.icon__instanceNameContainer}>
                <span
                  className={styles.icon__instanceName}
                  style={{ width: this.isInstalling() ? '76px' : '130px' }}
                >
                  {name}
                </span>
                <span className={styles.icon__instancePercentage}>
                  {this.isInstalling() && ` (${this.updatePercentage()}%)`}
                </span>
              </span>
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenu
          id={`contextMenu-${name}`}
          onShow={e => {
            e.stopPropagation();
            selectInstance(name);
          }}
        >
          <span>
            {name} ({version})
          </span>
          <MenuItem
            disabled={this.isInstalling() || deleting || !isValid}
            onClick={this.handleClickPlay}
          >
            {playing.find(el => el.name === name) ? (
              <div>
                <Icon type="thunderbolt" theme="filled" /> Kill
              </div>
            ) : (
                <div>
                  <Icon type="play-circle" theme="filled" /> Launch
              </div>
              )}
          </MenuItem>
          <MenuItem
            disabled={this.isInstalling() || deleting || !isValid}
            data={{ foo: 'bar' }}
            onClick={() =>
              history.push({
                pathname: `/editInstance/${name}/settings/`,
                state: { modal: true }
              })
            }
          >
            <Icon type="tool" theme="filled" /> Manage
          </MenuItem>
          <MenuItem
            onClick={() => exec(`start "" "${path.join(PACKS_PATH, name)}"`)}
          >
            <Icon type="folder" theme="filled" /> Open Folder
          </MenuItem>
          <MenuItem
            onClick={() => {
              exec(
                `powershell $s=(New-Object -COM WScript.Shell).CreateShortcut('%userprofile%\\Desktop\\${name}.lnk');$s.TargetPath='${path.join(
                  APPPATH,
                  'GDLauncher.exe'
                )}';$s.Arguments='-i ${name}';$s.Save()`,
                error => {
                  if (error) {
                    log.error(`Error creating instance symlink: ${error}`);
                    message.error(
                      <span>
                        Error while crerating the shortcut. Click{' '}
                        <a
                          href="https://github.com/gorilla-devs/GDLauncher/wiki/Error-while-creating-an-instance's-shortcut"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          here
                        </a>{' '}
                        to know more
                      </span>
                    );
                  }
                }
              );
            }}
            disabled={
              this.isInstalling() ||
              process.platform !== 'win32' ||
              deleting ||
              !isValid
            }
          >
            <Icon type="link" theme="outlined" /> Create Shortcut
          </MenuItem>
          <MenuItem
            disabled={this.isInstalling() || deleting || !isValid}
            onClick={() => this.props.addToQueue(name, version, forgeVersion)}
        >
            <Icon type="export" theme="outlined" /> Repair
          </MenuItem>
        <MenuItem
          disabled={this.isInstalling() || deleting}
          data={{ foo: 'bar' }}
          onClick={this.deleteInstance}
          preventClose
        >
          {deleting ? (
            <div>
              <Icon type="loading" theme="outlined" /> Deleting...
              </div>
          ) : (
              <div>
                <Icon type="delete" theme="filled" /> Delete
              </div>
            )}
        </MenuItem>
        </ContextMenu>
      </div >
    );
  };
}
