// @flow
import React, { Component } from 'react';
import { message, Icon, Tooltip } from 'antd';
import psTree from 'ps-tree';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import fsa from 'fs-extra';
import path from 'path';
import fs from 'fs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import log from 'electron-log';
import { promisify } from 'util';
import { exec } from 'child_process';
import { shell } from 'electron';
import { hideMenu } from 'react-contextmenu/es6/actions';
import { PACKS_PATH, APPPATH } from '../../constants';
import { history } from '../../store/configureStore';
import styles from './DInstance.scss';
import InstanceIcon from '../../assets/images/instanceDefault.png';

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
      version: null,
      isValid: true,
      forgeVersion: null,
      icon: `url(${InstanceIcon}) center no-repeat`
    };
  }

  componentDidMount = async () => {
    this.updateInstanceConfig();

    // This updates the config data every second
    this.interval = setInterval(() => {
      this.updateInstanceConfig();
    }, 1000);

    const config = JSON.parse(
      await promisify(fs.readFile)(
        path.join(PACKS_PATH, this.props.name, 'config.json')
      )
    );
    if (config.icon) {
      const icon = await promisify(fs.readFile)(
        path.join(PACKS_PATH, this.props.name, config.icon)
      );
      this.setState({
        icon: `url("data:image/png;base64,${icon.toString('base64')}")`
      });
    }
  };

  componentDidUpdate = () => {
    this.percentage = this.updatePercentage();
  };

  componentWillUnmount = () => {
    clearInterval(this.interval);
  };

  updateInstanceConfig = async () => {
    const { name } = this.props;
    if (!this.isInstalling()) {
      try {
        const config = JSON.parse(
          await promisify(fs.readFile)(
            path.join(PACKS_PATH, name, 'config.json')
          )
        );
        const { version, forgeVersion } = config;
        if (config.icon) {
          const icon = await promisify(fs.readFile)(
            path.join(PACKS_PATH, this.props.name, config.icon)
          );
          this.setState({
            icon: `url("data:image/png;base64,${icon.toString('base64')}")`
          });
        } else {
          this.setState({
            icon: `url(${InstanceIcon}) center no-repeat`
          });
        }
        this.setState({
          version,
          forgeVersion:
            forgeVersion === null
              ? null
              : forgeVersion.includes('-')
              ? forgeVersion.split('-')[1]
              : forgeVersion
        });
      } catch (e) {
        console.log(e);
        this.setState({
          version: 'Error',
          isValid: false
        });
      }
    }
  };

  isInstalling = () => {
    const { name, installingQueue } = this.props;
    if (installingQueue[name]) return true;
    return false;
  };

  updatePercentage = () => {
    const { name, installingQueue } = this.props;
    const { percentage } = installingQueue[name] || 0;
    if (installingQueue[name]) {
      switch (installingQueue[name].status) {
        case 'Queued':
          return 0;
        case 'Downloading':
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
        message.info('Instance terminated from user');
      } else {
        startInstance(name);
        selectInstance(name);
      }
    }
  };

  render = () => {
    const { name, selectedInstance, selectInstance, playing } = this.props;
    const { version, isValid, forgeVersion } = this.state;
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
            {!isValid && !this.isInstalling() && (
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
                  background: this.state.icon,
                  filter: this.isInstalling()
                    ? "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'><filter id='grayscale'><feColorMatrix type='matrix' values='0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0'/></filter></svg>#grayscale\")"
                    : ''
                }}
              />
              <span className={styles.icon__instanceNameContainer}>
                <span
                  className={styles.icon__instanceName}
                  style={{ width: this.isInstalling() ? '76px' : '120px' }}
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
            disabled={this.isInstalling() || !isValid}
            onClick={this.handleClickPlay}
          >
            {playing.find(el => el.name === name) ? (
              <div>
                <FontAwesomeIcon icon="bolt" /> Kill
              </div>
            ) : (
              <div>
                <FontAwesomeIcon icon="play" /> Launch
              </div>
            )}
          </MenuItem>
          <MenuItem
            disabled={this.isInstalling() || !isValid}
            data={{ foo: 'bar' }}
            onClick={() =>
              history.push({
                pathname: `/editInstance/${name}/settings/`,
                state: { modal: true }
              })
            }
          >
            <FontAwesomeIcon icon="pen" /> Manage
          </MenuItem>
          <MenuItem onClick={() => shell.openItem(path.join(PACKS_PATH, name))}>
            <FontAwesomeIcon icon="folder" /> Open Folder
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
              !isValid ||
              process.env.NODE_ENV === 'development'
            }
          >
            <FontAwesomeIcon icon="link" /> Create Shortcut
          </MenuItem>
          {/* <MenuItem
            disabled={this.isInstalling() || !isValid}
            onClick={() => {}}
          >
            <FontAwesomeIcon icon='copy' /> Duplicate
          </MenuItem> */}
          <MenuItem
            disabled={
              this.isInstalling() ||
              !isValid ||
              playing.find(el => el.name === name)
            }
            onClick={() => this.props.addToQueue(name, version, forgeVersion)}
          >
            <FontAwesomeIcon icon="wrench" /> Repair
          </MenuItem>
          <MenuItem
            disabled={
              this.isInstalling() || playing.find(el => el.name === name)
            }
            data={{ foo: 'bar' }}
            onClick={() =>
              history.push({
                pathname: `/confirmInstanceDelete/instance/${name}`,
                state: { modal: true }
              })
            }
          >
            <FontAwesomeIcon icon="trash" /> Delete
          </MenuItem>
        </ContextMenu>
      </div>
    );
  };
}
