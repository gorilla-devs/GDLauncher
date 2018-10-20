import React from 'react';
import { bindActionCreators } from 'redux';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button, Icon, Tooltip } from 'antd';
import { connect } from 'react-redux';
import CIcon from '../../../Common/Icon/Icon';
import CopyIcon from '../../../Common/CopyIcon/CopyIcon';
import styles from './MyAccount_Preferences.scss';
import SettingCard from '../SettingCard/SettingCard';
import Title from '../Title/Title';
import SwitchSetting from '../SwitchSetting/SwitchSetting';
import * as SettingsActions from '../../../../actions/settings';

const MyAccount = (props) => {
  return (
    <div>
      <Title>My Account</Title>
      <div className={styles.accountInfo}>
        <div>
          <CIcon size={70}>
            {props.username.charAt(0).toUpperCase()}
          </CIcon>
        </div>
        <div>
          <span>USERNAME</span>
          <span className={styles.info}>{props.username}</span> <CopyIcon text={props.username} />
          <div className={styles.divider} />
          <span>EMAIL</span>
          <span className={styles.info}>{props.email}</span> <CopyIcon text={props.email} />
        </div>
      </div>
      <Title>Preferences</Title>
      <SettingCard>
        <SwitchSetting
          mainText="Enable Sounds"
          description="Enable sounds to be played when specific actions are triggered"
          icon="sound"
          checked={props.settings.sounds}
          onChange={props.setSounds}
        />
      </SettingCard>
    </div>
  );
};

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

export default connect(mapStateToProps, mapDispatchToProps)(MyAccount);