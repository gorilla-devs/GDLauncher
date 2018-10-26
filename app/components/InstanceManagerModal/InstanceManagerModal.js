// @flow
import React, { Component } from 'react';
import { Form } from 'antd';
import { Route } from 'react-router-dom';
import styles from './InstanceManagerModal.scss';
import Modal from '../Common/Modal/Modal';
import SideMenu from '../Common/SideMenu/SideMenu';
import MenuItem from '../Common/SideMenu/MenuItem/MenuItem';
import Settings from './Settings/Settings';
import ModsManager from './ModsManager/ModsManager';
import ResourcePacks from './ResourcePacks/ResourcePacks';
import Worlds from './Worlds/Worlds';
import Screenshots from './Screenshots/Screenshots';


type Props = {};
let pack;

class InstanceManagerModal extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      unMounting: false
    };
  }

  closeModal = () => {
    this.setState({ unMounting: true })
  };


  render() {
    return (
      <Modal history={this.props.history} unMount={this.state.unMounting} title={`Instance Editor: Editing "${this.props.match.params.instance}"`} style={{ width: '90%', height: '90%', left: '5%' }}>
        <div className={styles.container}>
          <SideMenu match={this.props.match}>
            <MenuItem active={this.props.match.params.page === 'settings'} to={`/editInstance/${this.props.match.params.instance}/settings`}>Settings</MenuItem>
            <MenuItem active={this.props.match.params.page === 'mods'} to={`/editInstance/${this.props.match.params.instance}/mods/local`}>Mods Manager</MenuItem>
            <MenuItem active={this.props.match.params.page === 'resourcepacks'} to={`/editInstance/${this.props.match.params.instance}/resourcepacks`}>Resource Packs</MenuItem>
            <MenuItem active={this.props.match.params.page === 'worlds'} to={`/editInstance/${this.props.match.params.instance}/worlds`}>Worlds</MenuItem>
            <MenuItem active={this.props.match.params.page === 'screenshots'} to={`/editInstance/${this.props.match.params.instance}/screenshots`}>Screenshots</MenuItem>
          </SideMenu>
          <div className={styles.content}>
            <Route path="/editInstance/:instance/settings" render={() => <Settings close={this.closeModal} instance={this.props.match.params.instance} />} />
            <Route path="/editInstance/:instance/mods/:state/:version?/:mod?" component={ModsManager} />
            <Route path="/editInstance/:instance/resourcepacks" component={ResourcePacks} />
            <Route path="/editInstance/:instance/worlds" component={Worlds} />
            <Route path="/editInstance/:instance/screenshots" component={Screenshots} />
          </div>
        </div>
      </Modal>
    );
  }
}

export default InstanceManagerModal;
