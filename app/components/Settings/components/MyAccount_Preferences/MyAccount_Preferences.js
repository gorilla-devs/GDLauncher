import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button, Icon, Tooltip } from 'antd';
import { connect } from 'react-redux';
import CIcon from '../../../Common/Icon/Icon';
import CopyIcon from '../../../Common/CopyIcon/CopyIcon';
import styles from './MyAccount_Preferences.scss';
import SettingCard from '../SettingCard/SettingCard';
import Title from '../Title/Title';
import SwitchSetting from '../SwitchSetting/SwitchSetting';

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
          <span className={styles.info}>{props.username}</span> <CopyIcon text={'killpowa'} />
          <div className={styles.divider} />
          <span>EMAIL</span>
          <span className={styles.info}>{props.email}</span> <CopyIcon text={'davide.ceschia@gmail.com'} />
        </div>
      </div>
      <Title>Preferences</Title>
      <SettingCard>
        <SwitchSetting mainText="Enable Sounds" description="Enable sounds to be played when specific actions are triggered" />
      </SettingCard>
    </div>
  );
};

function mapStateToProps(state) {
  return {
    username: state.auth.displayName,
    email: state.auth.email
  };
}

export default connect(mapStateToProps)(MyAccount);