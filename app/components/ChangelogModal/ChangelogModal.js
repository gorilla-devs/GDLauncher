import React, { useState, useEffect } from 'react';
import store from '../../localStore';
import styles from './ChangelogModal.scss';
import Modal from '../Common/Modal/Modal';

export default props => {
  const [unMount, setUnMount] = useState(false);

  useEffect(() => {
    store.set('showChangelogs', false);
  }, []);

  const openDiscord = () => {
    require('electron').shell.openExternal("https://discord.gg/ZxRxPqn");
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
            <li>
              <span className={styles.summary}>
                Instances can now have custom icons!
              </span>{' '}
              Select an instance and click on "manage" to do it!
            </li>
            <li>
              <span className={styles.summary}>
                There is a new mods manager for instances,
              </span>{' '}
              it's now a lot easier to use and the scroll position no longer
              resets when viewing a specific mod page
            </li>
            <li>
              <span className={styles.summary}>
                There's now a dedicated page for changelogs
              </span>{' '}
              when opening the launcher after an update. Yeeee
            </li>
          </ul>
        </div>
        <h2 className={styles.hrTextRed}>SOME FIXED BUGS</h2>
        <div className={styles.subHrList}>
          <ul>
            <li>
              <span className={styles.summary}>
                Deleting instances is now safe!
              </span>{' '}
              O o o o u r B a a a d
            </li>
            <li>
              <span className={styles.summary}>
                The scrollbar is now more usable,
              </span>{' '}
              it's a little wider and easier to use
            </li>
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
