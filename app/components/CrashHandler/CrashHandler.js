import React from 'react';
import { remote } from 'electron';
import { Button } from 'antd';
import creeper from '../../assets/images/creeper.png';

import styles from './CrashHandler.scss';

export default props => {
  return (
    <div className={styles.main}>
      <div>
        <img src={creeper} />
        <h1>WE’RE SSSSSSSORRY</h1>
        <h2>GDLauncher ran into a creeper and blew up..</h2>
        <Button
          type="primary"
          onClick={() => {
            remote.app.relaunch();
            remote.app.quit();
          }}
        >
          Restart GDLauncher
        </Button>
      </div>
    </div>
  );
};
