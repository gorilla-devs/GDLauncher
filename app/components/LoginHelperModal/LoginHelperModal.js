import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import Modal from '../Common/Modal/Modal';
import styles from './LoginHelperModal.scss';

const DiscordModal = ({ match, history }) => {
  const { t } = useTranslation();
  return (
    <Modal history={history} style={{ height: 550 }}>
      <div className={styles.container}>
        <h3>{t('loginHelperTitle1', 'What login credentials should I use?')}</h3>
        <p>
          {t('loginHelperContent1', 'Our launcher uses your normal Mojang credentials, so the same you would use in the vanilla launcher')}
        </p>
        <h3>{t('loginHelperTitle2', 'Why should i give you my credentials?')}</h3>
        <p>
          {t('loginHelperContent2', 'We use your credentials to ensure you bought the game (it is required by Mojang\'s TOS). We do that by contacting Mojang\'s server and asking them.')}
        </p>
        <h3>{t('loginHelperTitle3', 'Do you store my credentials in your server?')}</h3>
        <p>
          {t('loginHelperContent3', 'No, we do not store any information about our users.')}
        </p>
        <h3>{t('loginHelperTitle4', 'Can I delete the informations you have about me?')}</h3>
        <p>
          {t('loginHelperContent4', 'Sure, you can contact us by email and we will remove any information related to you')}
        </p>
        <p>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://gorilladevs.com/terms"
          >
            {t('loginHelperContent4_1', 'If you want to know more, you can check out our Terms of Service')}
          </a>
        </p>
        <h3>{t('loginHelperTitle5', 'What is "Skip Login"?')}</h3>
        {t('loginHelperContent5', 'Skip login is a function that allows you to log-in without you actually typing anything. It checks if you already logged-in in the official minecraft launcher and uses those informations to log you in. You can still choose whether to stay logged in or not.')}
      </div>
    </Modal>
  );
};

export default DiscordModal;
