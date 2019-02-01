// @flow
import React, { Component } from 'react';
import { Form } from 'antd';
import { Route } from 'react-router-dom';
import { remote } from 'electron';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import { promisify } from 'util';
import log from 'electron-log';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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

type Props = {};
let pack;

class InstanceManagerModal extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      unMounting: false,
      instanceIcon: InstanceIcon
    };
  }

  readConfig = async () => {
    const config = JSON.parse(
      await promisify(fs.readFile)(
        path.join(PACKS_PATH, this.props.match.params.instance, 'config.json')
      )
    );
    return config;
  };

  closeModal = () => {
    this.setState({ unMounting: true });
  };

  componentDidMount = async () => {
    try {
      const config = JSON.parse(
        await promisify(fs.readFile)(
          path.join(PACKS_PATH, this.props.match.params.instance, 'config.json')
        )
      );
      if (config.icon) {
        const icon = await promisify(fs.readFile)(
          path.join(PACKS_PATH, this.props.match.params.instance, config.icon)
        );
        this.setState({
          instanceIcon: `data:image/png;base64,${icon.toString('base64')}`
        });
      }
    } catch {
      log.warn(
        'The instance icon could not be set because it does not exist or the config file is corrupted'
      );
    }
  };

  selectNewIcon = e => {
    e.stopPropagation();
    remote.dialog.showOpenDialog(
      {
        filters: [{ name: 'Image', extensions: ['png', 'jpg', 'jpeg'] }],
        properties: ['openFile']
      },
      async paths => {
        await promisify(fs.copyFile)(
          paths[0],
          path.join(
            PACKS_PATH,
            this.props.match.params.instance,
            `icon${path.extname(paths[0])}`
          )
        );
        const config = await this.readConfig();
        await promisify(fs.writeFile)(
          path.join(
            PACKS_PATH,
            this.props.match.params.instance,
            'config.json'
          ),
          JSON.stringify({
            ...config,
            icon: `icon${path.extname(paths[0])}`
          })
        );

        const icon = await promisify(fs.readFile)(
          path.join(
            PACKS_PATH,
            this.props.match.params.instance,
            `icon${path.extname(paths[0])}`
          )
        );
        this.setState({
          instanceIcon: `data:image/png;base64,${icon.toString('base64')}`
        });
      }
    );
  };

  removeInstanceIcon = async e => {
    e.stopPropagation();
    try {
      const config = await this.readConfig();
      await promisify(fs.writeFile)(
        path.join(PACKS_PATH, this.props.match.params.instance, 'config.json'),
        JSON.stringify(_.omit(config, 'icon'))
      );
      this.setState({
        instanceIcon: InstanceIcon
      });
    } catch {
      log.warn('The instance icon could not be removed');
    }
  };

  render() {
    return (
      <Modal
        history={this.props.history}
        unMount={this.state.unMounting}
        title={`Editing "${this.props.match.params.instance}"`}
        style={{ width: '90vw', height: '90vh', maxWidth: 1000 }}
      >
        <div className={styles.container}>
          <SideMenu
            match={this.props.match}
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              paddingTop: 10
            }}
          >
            <span
              className={styles.instanceIconContainer}
              onClick={this.selectNewIcon}
            >
              <span
                className={styles.instanceIconText}
                style={{
                  top: this.state.instanceIcon !== InstanceIcon ? 50 : 40
                }}
              >
                Change <br /> Icon
              </span>
              <img
                className={styles.instanceIcon}
                src={this.state.instanceIcon}
              />
              <div className={styles.instanceIconOverlay} />
              {this.state.instanceIcon !== InstanceIcon && (
                <FontAwesomeIcon
                  onClick={this.removeInstanceIcon}
                  icon="window-close"
                  className={styles.resetIcon}
                />
              )}
            </span>
            <MenuItem
              active={this.props.match.params.page === 'settings'}
              to={`/editInstance/${this.props.match.params.instance}/settings`}
            >
              Settings
            </MenuItem>
            <MenuItem
              active={this.props.match.params.page === 'mods'}
              to={`/editInstance/${
                this.props.match.params.instance
              }/mods/local`}
            >
              Mods Manager
            </MenuItem>
            <MenuItem
              active={this.props.match.params.page === 'resourcepacks'}
              to={`/editInstance/${
                this.props.match.params.instance
              }/resourcepacks`}
            >
              Resource Packs
            </MenuItem>
            <MenuItem
              active={this.props.match.params.page === 'worlds'}
              to={`/editInstance/${this.props.match.params.instance}/worlds`}
            >
              Worlds
            </MenuItem>
            <MenuItem
              active={this.props.match.params.page === 'screenshots'}
              to={`/editInstance/${
                this.props.match.params.instance
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
                  close={this.closeModal}
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
