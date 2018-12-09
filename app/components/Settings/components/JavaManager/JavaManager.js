import React, { useState, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button, Icon, Tooltip, Input } from 'antd';
import path from 'path';
import { connect } from 'react-redux';
import CopyIcon from '../../../Common/CopyIcon/CopyIcon';
import styles from './JavaManager.scss';
import SettingCard from '../SettingCard/SettingCard';
import Title from '../Title/Title';
import javaLocator from '../../../../utils/javaLocationFinder';
import store from '../../../../localStore';
import SwitchSetting from '../SwitchSetting/SwitchSetting';
import SettingInput from '../SettingInput/SettingInput';
import * as SettingsActions from '../../../../actions/settings';


function JavaManager(props) {

  console.log(props);

  const openFolderDialog = () => {
    const { dialog } = require('electron').remote;
    dialog.showOpenDialog({ properties: ['openFile'] }, paths => {
      props.setJavaPath(false, paths[0])
    });
  };

  return (
    <div>
      <Title>Java Manager (Global)</Title>
      <SwitchSetting
        mainText="Autodetect Java Path"
        description="If enabled, java path will be autodetected"
        icon="folder"
        checked={props.settings.javaPath.autodetected}
        onChange={async c => props.setJavaPath(c, c ? null : await javaLocator())}
      />
      {props.settings.javaPath.autodetected ? null :
        <div>
          <Title>Java Custom Path</Title>
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
            placeholder="(If empty, the game won't start)"
            onChange={e => props.setJavaPath(false, e.target.value)}
            value={props.settings.javaPath.path}
          />
          <Button type="primary" icon="folder" theme="filled" onClick={() => openFolderDialog()} style={{ height: 60, marginLeft: 10 }} />
        </div>
      }
    </div>
  );
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
