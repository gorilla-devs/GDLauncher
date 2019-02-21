import React, { useState, useEffect } from 'react';
import store from '../../localStore';
import styles from './ChangelogModal.scss';
import Modal from '../Common/Modal/Modal';
import ChangelogRow from './ChangelogRow';

export default props => {
  const [unMount, setUnMount] = useState(false);

  useEffect(() => {
    store.set('showChangelogs', false);
  }, []);

  const openDiscord = () => {
    require('electron').shell.openExternal('https://discord.gg/ZxRxPqn');
  };

  return (
    <Modal
      history={props.history}
      unMount={unMount}
      title="WHAT'S NEW"
      style={{ height: 390, width: 540 }}
    >
      <div className={styles.container}>
        <h2 className={styles.hrTextGreen}>SOME COOL NEW STUFF</h2>
        <div className={styles.subHrList}>
          <ul>
            <ChangelogRow
              main="Added a modal dialog confirmation"
              secondary="when deleting an instance"
            />
            <ChangelogRow
              main="We are trying to make the UI as consistent as possible"
              secondary=", so we changed some visual effects. You shouldn't notice it"
            />
          </ul>
        </div>
        <h2 className={styles.hrTextRed}>SOME BUGFIXES</h2>
        <div className={styles.subHrList}>
          <ul>
            <ChangelogRow
              main="Fixed a bug when downloading mods"
              secondary="we hope you are proud of us now :)"
            />
            <ChangelogRow
              main="When searching for a mod that doesn't exist"
              secondary="it now displays an appropriate message"
            />
            <ChangelogRow
              main="Modals animation should feel smoother now"
              secondary="let us know if you agree"
            />
            <ChangelogRow
              main="Improved compatibility with older versions of the launcher"
              secondary={`, if instances won't start, try clicking "repair" and try again`}
            />
          </ul>
        </div>
        <h2 className={styles.hrTextYellow}>WE LOVE YOU</h2>
        <span className={styles.summary}>
          We love our users, that's why we have a dedicated discord server just
          to talk with all of them :)
        </span>
        <br />
        <img
          src="https://discordapp.com/assets/192cb9459cbc0f9e73e2591b700f1857.svg"
          className={styles.discordImg}
          onClick={openDiscord}
        />
      </div>
    </Modal>
  );
};
