import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose } from '@fortawesome/free-solid-svg-icons';
import Modal from '../Common/Modal/Modal';
import styles from './Settings.scss';
import SideMenu from '../Common/SideMenu/SideMenu';
import MenuItem from '../Common/SideMenu/MenuItem/MenuItem';
import Content from './components/Content/Content';

const Settings = ({ match, history }) => {
  const { t } = useTranslation();
  return (
    <Modal
      history={history}
      header="false"
      style={{ width: '100%', height: '100%', left: '0' }}
      backBtn={
        <div className={styles.closeBtn}>
          <FontAwesomeIcon icon={faWindowClose} />
        </div>
      }
    >
      <div className={styles.container}>
        <SideMenu match={match}>
          <MenuItem
            active={match.params.page === 'myAccount_Preferences'}
            to="/settings/myAccount_Preferences"
          >
            {t('MyAccountAndPreferences', 'My Account & Preferences')}
          </MenuItem>
          <MenuItem active={match.params.page === 'java'} to="/settings/java">
            {t('Java', 'Java')}
          </MenuItem>
          <MenuItem
            active={match.params.page === 'instances'}
            to="/settings/instances"
          >
            {t('Instances', 'Instances')}
          </MenuItem>
          <MenuItem active={match.params.page === 'ui'} to="/settings/ui">
            {t('UserInterface', 'User Interface')}
          </MenuItem>
        </SideMenu>
        <Content match={match} />
      </div>
    </Modal>
  );
};

export default Settings;
