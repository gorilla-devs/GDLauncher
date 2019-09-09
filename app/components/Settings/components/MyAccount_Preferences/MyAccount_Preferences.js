import React, { useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect, useSelector, useDispatch } from 'react-redux';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import { ipcRenderer } from 'electron';
import store from '../../../../localStore';
import CIcon from '../../../Common/Icon/Icon';
import CopyIcon from '../../../Common/CopyIcon/CopyIcon';
import styles from './MyAccount_Preferences.scss';
import SettingCard from '../SettingCard/SettingCard';
import Title from '../Title/Title';
import SwitchSetting from '../SwitchSetting/SwitchSetting';
import SelectSetting from '../SelectSetting/SelectSetting';
import { getCurrentAccount } from '../../../../utils/selectors';
import { updateSoundsSetting, updateReleaseChannel } from '../../../../reducers/settings/actions';
import { faRocket, faVolumeUp } from '@fortawesome/free-solid-svg-icons';

const MyAccount = props => {
  const account = useSelector(state => getCurrentAccount(state));
  const releaseChannel = useSelector(state => state.settings.releaseChannel);
  const sounds = useSelector(state => state.settings.sounds);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  return (
    <div>
      <Title>{t('MyAccount', 'My Account')}</Title>
      <div className={styles.accountInfo}>
        <div>
          <CIcon size={70}>{account.selectedProfile.name.charAt(0).toUpperCase()}</CIcon>
        </div>
        <div>
          <span>{t('Username', 'Username')}</span>
          <span className={styles.info}>{account.selectedProfile.name}</span>{' '}
          <CopyIcon text={account.selectedProfile.name} />
          <div className={styles.divider} />
          <span>{t('Email', 'Email')}</span>
          <span className={styles.info}>{account.user.email}</span>{' '}
          <CopyIcon text={account.user.email} />
        </div>
      </div>
      <Title>{t('Preferences', 'Preferences')}</Title>
      <SettingCard>
        <SwitchSetting
          mainText={t('EnableSoundsTitle', 'Enable Sounds')}
          description={t('EnableSoundsDescription', 'Enable sounds to be played when specific actions are triggered')}
          checked={sounds}
          onChange={v => dispatch(updateSoundsSetting(value))}
          icon={faVolumeUp}
        />
        <SelectSetting
          mainText={<span>{t('ReleaseChannel', 'Release Channel')}</span>}
          description={t('ReleaseChannelDescription', 'Stable updates once a month, beta does update more often but it may have more bugs.')}
          icon={faRocket}
          onChange={v => {
            dispatch(updateReleaseChannel(v));
            message.info(
              t('NeedToRestartToApplyChange', 'In order to apply this change you need to restart the launcher')
            );
          }}
          options={['Stable', 'Beta']}
          defaultValue={releaseChannel}
        />
      </SettingCard>
    </div>
  );
};

export default MyAccount;
