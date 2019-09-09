// @flow
import React, { useState } from 'react';
import { Form } from 'antd';
import { Route } from 'react-router-dom';
import { remote } from 'electron';
import { promises as fs } from 'fs';
import path from 'path';
import _ from 'lodash';
import { promisify } from 'util';
import log from 'electron-log';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose } from '@fortawesome/free-solid-svg-icons';
import styles from './InstanceManagerModal.scss';
import { PACKS_PATH } from '../../constants';
import Modal from '../Common/Modal/Modal';
import SideMenu from '../Common/SideMenu/SideMenu';
import MenuItem from '../Common/SideMenu/MenuItem/MenuItem';
import Settings from './Settings/Settings';
import ModsManager from './ModsManager/ModsManager';
import ResourcePacks from './ResourcePacks/ResourcePacks';
import Worlds from './Worlds/Worlds';
import Screenshots from './Screenshots/Screenshots';
import InstanceIcon from '../../assets/images/instanceDefault.png';
import ModpackVersions from './ModpackVersions/ModpackVersions';

let pack;

function InstanceManagerModal(props) {
  const [unMounting, setUnMounting] = useState(false);
  const [instanceIcon, setInstanceIcon] = useState(InstanceIcon);
  const [version, setVersion] = useState(null);

  const readConfig = async () => {
    const config = JSON.parse(
      await fs.readFile(
        path.join(PACKS_PATH, this.props.match.params.instance, 'config.json')
      )
    );
    return config;
  };

  const closeModal = () => {
    setUnMounting(true);
  };

  componentDidMount = async () => {
    try {
      const config = await readConfig();
      setVersion(config.version);
      if (config.icon) {
        const icon = await fs.readFile(
          path.join(PACKS_PATH, this.props.match.params.instance, config.icon)
        );
        setInstanceIcon(`data:image/png;base64,${icon.toString('base64')}`);
      }
    } catch {
      log.warn(
        'The instance icon could not be set because it does not exist or the config file is corrupted'
      );
    }
  };

  const selectNewIcon = e => {
    e.stopPropagation();
    remote.dialog.showOpenDialog(
      {
        filters: [{ name: 'Image', extensions: ['png', 'jpg', 'jpeg'] }],
        properties: ['openFile']
      },
      async paths => {
        await fs.copyFile(
          paths[0],
          path.join(
            PACKS_PATH,
            props.match.params.instance,
            `icon${path.extname(paths[0])}`
          )
        );
        const config = await readConfig();
        await fs.writeFile(
          path.join(
            PACKS_PATH,
            props.match.params.instance,
            'config.json'
          ),
          JSON.stringify({
            ...config,
            icon: `icon${path.extname(paths[0])}`
          })
        );

        const icon = await fs.readFile(
          path.join(
            PACKS_PATH,
            this.props.match.params.instance,
            `icon${path.extname(paths[0])}`
          )
        );
        setInstanceIcon(`data:image/png;base64,${icon.toString('base64')}`);
      }
    );
  };

  const removeInstanceIcon = async e => {
    e.stopPropagation();
    try {
      const config = await readConfig();
      await fs.writeFile(
        path.join(PACKS_PATH, this.props.match.params.instance, 'config.json'),
        JSON.stringify(_.omit(config, 'icon'))
      );
      setInstanceIcon(InstanceIcon);
    } catch {
      log.warn('The instance icon could not be removed', this.props.match.params.instance);
    }
  };

  render() {
    return (
      <Modal
        history={props.history}
        unMount={unMounting}
        title={`Editing "${props.match.params.instance}"`}
        style={{ width: '90vw', height: '90vh', maxWidth: 1000 }}
      >
        <div className={styles.container}>
          <SideMenu
            match={props.match}
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              paddingTop: 10
            }}
          >
            <span
              className={styles.instanceIconContainer}
              onClick={selectNewIcon}
            >
              <span
                className={styles.instanceIconText}
                style={{
                  top: instanceIcon !== InstanceIcon ? 50 : 40
                }}
              >
                Change <br /> Icon
              </span>
              <img
                className={styles.instanceIcon}
                src={instanceIcon}
              />
              <div className={styles.instanceIconOverlay} />
              {instanceIcon !== InstanceIcon && (
                <FontAwesomeIcon
                  onClick={removeInstanceIcon}
                  icon={faWindowClose}
                  className={styles.resetIcon}
                />
              )}
            </span>
            <MenuItem
              active={props.match.params.page === 'settings'}
              to={`/editInstance/${props.match.params.instance}/settings`}
            >
              Settings
            </MenuItem>
            <MenuItem
              active={props.match.params.page === 'mods'}
              to={`/editInstance/${
                props.match.params.instance
                }/mods/local/${version}`}
            >
              Mods Manager
            </MenuItem>
            <MenuItem
              active={props.match.params.page === 'modpackVersions'}
              to={`/editInstance/${
                props.match.params.instance
                }/modpackVersions`}
            >
              Modpack Versions
            </MenuItem>
            <MenuItem
              active={props.match.params.page === 'resourcepacks'}
              to={`/editInstance/${
                props.match.params.instance
                }/resourcepacks`}
            >
              Resource Packs
            </MenuItem>
            <MenuItem
              active={props.match.params.page === 'worlds'}
              to={`/editInstance/${props.match.params.instance}/worlds`}
            >
              Worlds
            </MenuItem>
            <MenuItem
              active={props.match.params.page === 'screenshots'}
              to={`/editInstance/${
                props.match.params.instance
                }/screenshots`}
            >
              Screenshots
            </MenuItem>
          </SideMenu>
          <div className={styles.content}>
            <Route
              path="/editInstance/:instance/settings"
              render={() => (
                <Settings
                  close={closeModal}
                  instance={this.props.match.params.instance}
                />
              )}
            />
            <Route
              path="/editInstance/:instance/mods/:state/:version?/:mod?"
              component={ModsManager}
            />
            <Route
              path="/editInstance/:instance/resourcepacks"
              component={ResourcePacks}
            />
            <Route
              path="/editInstance/:instance/modpackVersions"
              render={() => (
                <ModpackVersions
                  close={closeModal}
                  instance={props.match.params.instance}
                />
              )}
            />
            <Route path="/editInstance/:instance/worlds" component={Worlds} />
            <Route
              path="/editInstance/:instance/screenshots"
              component={Screenshots}
            />
          </div>
        </div>
      </Modal>
    );
  }
}

export default InstanceManagerModal;
