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

type Props = {};
let pack;

class InstanceManagerModal extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {

      }
    });
  }

  render() {
    return (
      <Modal history={this.props.history} title={`Instance Editor: Editing "${this.props.match.params.instance}"`} style={{ width: '90%', height: '90%', left: '5%' }}>
        <div className={styles.container}>
          <SideMenu match={this.props.match}>
            <MenuItem active={this.props.match.params.page === 'settings'} to={`/editInstance/${this.props.match.params.instance}/settings`}>Settings</MenuItem>
            <MenuItem active={this.props.match.params.page === 'mods'} to={`/editInstance/${this.props.match.params.instance}/mods/local`}>Mods Manager</MenuItem>
            <MenuItem active={this.props.match.params.page === 'resourcePacks'} to={`/editInstance/${this.props.match.params.instance}/resourcePacks`}>Resource Packs</MenuItem>
            <MenuItem active={this.props.match.params.page === 'worlds'} to={`/editInstance/${this.props.match.params.instance}/worlds`}>Worlds</MenuItem>
            <MenuItem active={this.props.match.params.page === 'screenshots'} to={`/editInstance/${this.props.match.params.instance}/screenshots`}>Screenshots</MenuItem>
          </SideMenu>
          <div className={styles.content}>
            <Route path="/editInstance/:instance/settings" render={() => <Settings instance={this.props.match.params.instance} />} />
            <Route path="/editInstance/:instance/mods/:state/:version?/:mod?" component={ModsManager} />
          </div>
        </div>
      </Modal>
    );
  }
}

export default InstanceManagerModal;
