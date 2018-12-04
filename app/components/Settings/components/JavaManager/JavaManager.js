import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button, Icon, Tooltip, Input } from 'antd';
import { connect } from 'react-redux';
import javaPath from '../../../../utils/javaLocationFinder';
import CopyIcon from '../../../Common/CopyIcon/CopyIcon';
import styles from './JavaManager.scss';
import SettingCard from '../SettingCard/SettingCard';
import Title from '../Title/Title';
import SwitchSetting from '../SwitchSetting/SwitchSetting';
import SettingInput from '../SettingInput/SettingInput';
import * as SettingsActions from '../../../../actions/settings';

type Props = {};

class JavaManager extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      javaPath: 'Loading...',
      javaInput: null
    };
  }

  componentDidMount = async () => {
    this.setState({
      javaPath: await javaPath()
    });
  };

  openFolderDialog = () => {
    const { dialog } = require('electron').remote;
    dialog.showOpenDialog({ properties: ['openDirectory'] }, this.folderDialogCallback);
  };

  folderDialogCallback = paths => {
    this.setState({ javaInput: paths[0] });
    console.log(this.state.javaInput);
  }

  render() {
    return (
      <div>
        <Title>Java Manager (Global)</Title>
        <div style={{ fontSize: 18 }}>
          Default Java Path <Icon type="folder" theme="filled" />
        </div>
        <Input
          size="large"
          style={{
            width: '90%',
            display: 'inline-block',
            height: '60px',
            marginBottom: 10,
            marginTop: 4
          }}
          prefix={
            <Icon
              type="folder"
              theme="filled"
              style={{ color: 'rgba(255,255,255,.8)' }}
            />
          }
          placeholder="(Autodetected if Empty)"
          value={this.state.javaInput}
        />
        <Button type="primary" icon="folder" theme="filled" onClick={() => this.openFolderDialog()} style={{ height: 60, marginLeft: 10 }} />
        Autodetected Path: <br />
        {this.state.javaPath}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    username: state.auth.displayName,
    email: state.auth.email,
    settings: state.settings
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(SettingsActions, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(JavaManager);
