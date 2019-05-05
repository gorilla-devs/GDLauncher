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
      title={`WHAT'S NEW IN v${require('../../../package.json').version}`}
      style={{ height: '70vh', width: 540 }}
    >
      <div className={styles.container}>

        <h2 className={styles.hrTextYellow}>WARNING!</h2>
        <span className={styles.summary}>
          This update contains <span style={{ color: '#f39c12' }}>breaking changes</span>. If your instances don't run, try right-clicking on them and select "Repair"
        </span>
        <div style={{ margin: 15 }} />
        <h2 className={styles.hrTextGreen}>SOME COOL NEW STUFF</h2>
        <div className={styles.subHrList}>
          <ul>
            <ChangelogRow
              main="Added a crash handler"
              secondary=" when things go wrong xD"
            />
            <ChangelogRow
              main="Added java memory override for instances"
              secondary=" yeeee"
            />
            <ChangelogRow
              main="Added java arguments override for instances"
              secondary=" yeeee"
            />
            <ChangelogRow
              main="Added support for Minecraft Forge 1.13"
              secondary=". Don't tilt if it looks like it's frozen, it may take a while"
            />
            <ChangelogRow
              main="Added support for custom path for instances"
              secondary=". After changing it, you'll need to restart the launcher"
            />
            <ChangelogRow
              main="When importing a zip, a default name is suggested"
              secondary=". You'll have more time to play now!!"
            />
          </ul>
        </div>
        <h2 className={styles.hrTextRed}>SOME BUGFIXES</h2>
        <div className={styles.subHrList}>
          <ul>
            <ChangelogRow
              main="Fixed download progress bar zindex"
              secondary=" lel"
            />
            <ChangelogRow
              main="Some improvements in the mods manager"
              secondary=", we're still working on it though"
            />
            <ChangelogRow
              main="The mods counter now shows the correct number of installed mods"
              secondary=", ouga buga"
            />
            <ChangelogRow
              main="Finally fixed the login token!!"
              secondary=", you won't need to login every time ever again :)"
            />
            <ChangelogRow
              main="Even though you don't see them"
              secondary=", we fixed and improved a lot of under-the-hood stuff. Enjoyy!"
            />
          </ul>
        </div>
        <h2 className={styles.hdTextBlue}>WE LOVE YOU</h2>
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
    </Modal >
  );
};
