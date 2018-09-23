// @flow
import React, { Component } from 'react';
import { Form } from 'antd';
import { Route } from 'react-router-dom';
import styles from './InstanceManagerModal.scss';
import Modal from '../Common/Modal/Modal';
import SideMenu from '../Common/SideMenu/SideMenu';
import MenuItem from '../Common/SideMenu/MenuItem/MenuItem';
import Settings from './components/Settings/Settings';

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
      <Modal history={this.props.history} title={`Instance Editor: Editing "${this.props.match.params.instance}"`} style={{ width: '80%', height: '80%', left: '10%' }}>
        <div className={styles.container}>
          <SideMenu match={this.props.match}>
            <MenuItem active={this.props.match.params.page === 'settings'} to={`/editInstance/${this.props.match.params.instance}/settings`}>Settings</MenuItem>
            <MenuItem active={this.props.match.params.page === 'java'} to="java">Mods Manager</MenuItem>
            <MenuItem active={this.props.match.params.page === 'instances'} to="instances">Resource Packs</MenuItem>
            <MenuItem active={this.props.match.params.page === 'ui'} to="ui">Worlds</MenuItem>
            <MenuItem active={this.props.match.params.page === 'ui'} to="ui">Screenshots</MenuItem>
          </SideMenu>
          <div className={styles.content}>
            <Route path={`/editInstance/${this.props.match.params.instance}/settings`} component={Settings} />
          </div>
        </div>
      </Modal>
    );
  }
}

export default InstanceManagerModal;
