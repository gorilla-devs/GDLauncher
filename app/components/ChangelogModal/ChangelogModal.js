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
      style={{ height: '70vh', width: 540 }}
    >
      <div className={styles.container}>
        <h2 className={styles.hrTextGreen}>SOME COOL NEW STUFF</h2>
        <div className={styles.subHrList}>
          <ul>
            <ChangelogRow
              main="We are refactoring quite a few parts of the code"
              secondary=", this will allow us to easily add features later on"
            />
            <ChangelogRow
              main="Drastically improved rendering performance"
              secondary=", it should now be 2x faster"
            />
            <ChangelogRow
              main="Modpacks icons are automatically set as instance icon when downloading them"
              secondary=""
            />
            <ChangelogRow
              main="Modpacks downloads should now be 4x faster"
              secondary="depending on your connection"
            />
            <ChangelogRow
              main="We now show the 'Playing on GDLauncher' presence on discord"
              secondary="hurraah!"
            />
            <ChangelogRow
              main="Updated the download progress style when downloading instances"
              secondary="do you like it??"
            />
            <ChangelogRow
              main="You can now change the java arguments from the launcher settings!"
              secondary="It will apply to all the instances"
            />
            <ChangelogRow
              main="Instances now have an animation when appearing."
              secondary="This will fix icons 'flashing' for a split second"
            />
          </ul>
        </div>
        <h2 className={styles.hrTextRed}>SOME BUGFIXES</h2>
        <div className={styles.subHrList}>
          <ul>
            <ChangelogRow
              main="Fixed the news not working"
              secondary=", not our fault. Minecraft.net changed it..."
            />
            <ChangelogRow
              main="Removed various errors stacking up"
              secondary="when java was not found"
            />
            <ChangelogRow
              main="Fixed mods dependancies not being correctly downloaded"
              secondary=" yeeeee"
            />
            <ChangelogRow
              main="Fixed broken mods and modpacks results"
              secondary="when the text contained whitespaces"
            />
            <ChangelogRow
              main="Fixed closing modal animation not working"
              secondary="when creating a new instance"
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
