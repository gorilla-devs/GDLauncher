import React, { useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { message } from 'antd';
import { ipcRenderer } from 'electron';
import store from '../../../../localStore';
import CIcon from '../../../Common/Icon/Icon';
import CopyIcon from '../../../Common/CopyIcon/CopyIcon';
import styles from './MyAccount_Preferences.scss';
import SettingCard from '../SettingCard/SettingCard';
import Title from '../Title/Title';
import SwitchSetting from '../SwitchSetting/SwitchSetting';
import * as SettingsActions from '../../../../actions/settings';
import SelectSetting from '../SelectSetting/SelectSetting';

const MyAccount = props => {
  const initialChannel =
    store.get('settings') &&
    (store.get('settings').releaseChannel === 'latest' ||
      store.get('settings').releaseChannel === 'beta')
      ? store.get('settings').releaseChannel
      : 'latest';

  const [channel, setChannel] = useState(
    initialChannel === 'latest' ? 'Stable' : 'Beta'
  );

  return (
    <div>
      <Title>My Account</Title>
      <div className={styles.accountInfo}>
        <div>
          <CIcon size={70}>{props.username.charAt(0).toUpperCase()}</CIcon>
        </div>
        <div>
          <span>USERNAME</span>
          <span className={styles.info}>{props.username}</span>{' '}
          <CopyIcon text={props.username} />
          <div className={styles.divider} />
          <span>EMAIL</span>
          <span className={styles.info}>{props.email}</span>{' '}
          <CopyIcon text={props.email} />
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
        <SelectSetting
          mainText={<span>Release Channel</span>}
          description="Stable updates once a month, beta does update more often but it may have more bugs."
          icon="rocket"
          placeholder="Select a theme"
          onChange={v => {
            setChannel(v);
            store.set(
              'settings.releaseChannel',
              v === 'Beta' ? 'beta' : 'latest'
            );
            message.info(
              'In order to apply this change you need to restart the launcher'
            );
          }}
          options={['Stable', 'Beta']}
          defaultValue={channel}
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MyAccount);
