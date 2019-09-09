// @flow
import React, { useState, useEffect } from 'react';
import { message, Icon, Tooltip } from 'antd';
import psTree from 'ps-tree';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import fsa from 'fs-extra';
import path from 'path';
import { promises as fs } from 'fs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBolt,
  faPlay,
  faPen,
  faFolder,
  faLink,
  faCopy,
  faTruckMoving,
  faWrench,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import log from 'electron-log';
import { promisify } from 'util';
import { exec } from 'child_process';
import { shell } from 'electron';
import { useDispatch } from 'react-redux';
import { hideMenu } from 'react-contextmenu/es6/actions';
import { PACKS_PATH, APPPATH } from '../../constants';
import { history } from '../../store/configureStore';
import styles from './DInstance.scss';
import InstanceIcon from '../../assets/images/instanceDefault.png';
import { repairInstance, updateupdateSelectedInstance, startInstance, updatePercentage } from '../../reducers/actions';

type Props = {
  name: string,
  installingQueue: object,
  updateSelectedInstance: ?string,
  startInstance: () => void,
  updateupdateSelectedInstance: () => void,
  repairInstance: () => void,
  playing: array
};

export default function DInstance(props) {
  const [version, setVersion] = useState(null);
  const [isValid, setIsValid] = useState(true);
  const [forgeVersion, setForgeversion] = useState(null);
  const [icon, setIcon] = useState(`url(${InstanceIcon}) center no-repeat`);
  const dipatch = useDispatch();

  useEffect(() => {
    updateInstanceConfig();

    // This updates the config data every second
    const interval = setInterval(() => {
      updateInstanceConfig();
    }, 1000);

    const percentage = dispatch(updatePercentage());

    return () => {
      clearInterval(interval);
    }
  }, []);


  const updateInstanceConfig = async () => {
    const { name } = props;
    if (!isInstalling()) {
      try {
        const config = JSON.parse(
          await fs.readFile(
            path.join(PACKS_PATH, name, 'config.json')
          )
        );
        const { version, forgeVersion } = config;

        // Tries to read the instance config file and updates the icon accordingly
        if (config.icon) {
          const icon = await fs.readFile(
            path.join(PACKS_PATH, this.props.name, config.icon)
          );
          setIcon(`url("data:image/png;base64,${icon.toString(
            'base64'
          )}") center no-repeat`);
        } else {
          setIcon(`url(${InstanceIcon}) center no-repeat`);
        }
        setVersion(version);
        setForgeversion(forgeVersion === null
          ? null
          : forgeVersion.includes('-')
            ? forgeVersion.split('-')[1]
            : forgeVersion);

      } catch (e) {
        setVersion('Error');
        setIsValid(false);
        setIcon(`url(${InstanceIcon}) center no-repeat`);
      }
    }
  };

  const isInstalling = () => {
    const { name, installingQueue } = props;
    if (installingQueue[name]) return true;
    return false;
  };

  const updatePercentage = () => {
    const { name, installingQueue } = props;
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

  const handleClickPlay = async e => {
    const { startInstance, selectInstance, name, playing } = props;
    if (!isInstalling()) {
      e.stopPropagation();
      if (playing.find(el => el.name === name) && isValid) {
        psTree(playing.find(el => el.name === name).pid, (err, children) => {
          children.forEach(el => {
            process.kill(el.PID);
          });
        });
        message.info('Instance terminated from user');
      } else {
        dispatch(startInstance(name));
        dispatch(selectInstance(name));
      }
    }
  };

  const { name, updateSelectedInstance, selectInstance, playing } = props;
  return (
    <div
      className={`${updateSelectedInstance === name ? styles.selectedItem : ''} ${
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
            dispatch(selectInstance(name));
          }}
          onDoubleClick={handleClickPlay}
          onKeyPress={handleKeyPress}
          role="button"
          tabIndex={0}
        >
          {playing.find(el => el.name === name) && (
            <span className={styles.playingIcon}>
              <FontAwesomeIcon icon={faPlay} style={{ fontSize: '17px' }} />
            </span>
          )}
          {this.isInstalling() && (
            <Icon
              className={styles.icon__iconState}
              type="loading"
              theme="outlined"
            />
          )}
          {!isValid && !isInstalling() && (
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
                background:
                  version !== null || isInstalling()
                    ? icon
                    : 'rgba(0, 0, 0, 0)',
                opacity: version !== null || isInstalling() ? 1 : 0,
                filter: isInstalling()
                  ? "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'><filter id='grayscale'><feColorMatrix type='matrix' values='0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0'/></filter></svg>#grayscale\")"
                  : ''
              }}
            />
            <span className={styles.icon__instanceNameContainer}>
              <span
                className={styles.icon__instanceName}
                style={{ width: 120 }}
              >
                {name}
              </span>
            </span>
            {isInstalling() && (
              <span className={styles.progressBarContainer}>
                <span className={styles.progressBar} />
                <span className={styles.actualProgress}>
                  <span style={{ width: `${updatePercentage()}%` }} />
                </span>
              </span>
            )}
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenu
        id={`contextMenu-${name}`}
        onShow={e => {
          e.stopPropagation();
          dispatch(selectInstance(name));
        }}
      >
        <span>
          {name} ({version})
          </span>
        <MenuItem
          disabled={isInstalling() || !isValid}
          onClick={handleClickPlay}
        >
          {playing.find(el => el.name === name) ? (
            <div>
              <span>
                <FontAwesomeIcon icon={faBolt} />
              </span>{' '}
              Kill
              </div>
          ) : (
              <div>
                <span>
                  <FontAwesomeIcon icon={faPlay} />
                </span>{' '}
                Launch
              </div>
            )}
        </MenuItem>
        <MenuItem
          disabled={isInstalling() || !isValid}
          data={{ foo: 'bar' }}
          onClick={() =>
            history.push({
              pathname: `/editInstance/${name}/settings/`,
              state: { modal: true }
            })
          }
        >
          <span>
            <FontAwesomeIcon icon={faPen} />
          </span>{' '}
          Manage
          </MenuItem>
        <MenuItem onClick={() => shell.openItem(path.join(PACKS_PATH, name))}>
          <span>
            <FontAwesomeIcon icon={faFolder} />
          </span>{' '}
          Open Folder
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
            isInstalling() ||
            process.platform !== 'win32' ||
            !isValid ||
            process.env.NODE_ENV === 'development'
          }
        >
          <span>
            <FontAwesomeIcon icon={faLink} />
          </span>{' '}
          Create Shortcut
          </MenuItem>
        {/* <MenuItem
            disabled={this.isInstalling() || !isValid}
            onClick={() => {}}
          >
            <FontAwesomeIcon icon={faCopy} /> Duplicate
          </MenuItem> */}
        <MenuItem
          disabled={
            isInstalling() ||
            !isValid ||
            playing.find(el => el.name === name)
          }
          data={{ foo: 'bar' }}
          onClick={() =>
            history.push({
              pathname: `/exportPackModal/${name}`,
              state: { modal: true }
            })
          }
        >
          <span>
            <FontAwesomeIcon icon={faTruckMoving} />
          </span>{' '}
          Export
          </MenuItem>
        <MenuItem
          disabled={
            isInstalling() ||
            !isValid ||
            playing.find(el => el.name === name)
          }
          onClick={() => dispatch(repairInstance(name))}
        >
          <span>
            <FontAwesomeIcon icon={faWrench} />
          </span>{' '}
          Repair
          </MenuItem>
        <MenuItem
          disabled={
            isInstalling() || playing.find(el => el.name === name)
          }
          data={{ foo: 'bar' }}
          onClick={() =>
            history.push({
              pathname: `/confirmInstanceDelete/instance/${name}`,
              state: { modal: true }
            })
          }
        >
          <span>
            <FontAwesomeIcon icon={faTrash} />
          </span>{' '}
          Delete
          </MenuItem>
      </ContextMenu>
    </div>
  );
}
