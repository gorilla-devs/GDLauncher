import React, { useState, useEffect } from 'react';
import { Progress } from 'antd';
import { ipcRenderer } from 'electron';
import { THEMES } from '../../constants';
import store from '../../localStore';
import shader from '../../utils/colors';
import background from '../../assets/images/login_background.jpg';
import styles from './AutoUpdate.scss';

export default props => {
  const [colors, setColors] = useState(
    store.get('settings') ? store.get('settings').theme : THEMES.default
  );
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    store.set('showChangelogs', true);
    ipcRenderer.on('download-progress', (ev, data) => {
      setPercentage(data);
    });
    ipcRenderer.on('update-downloaded', () => {
      ipcRenderer.send('apply-updates');
    });
    ipcRenderer.send('download-updates');
  }, []);

  return (
    <div
      className={styles.content}
      style={{
        background: `linear-gradient( ${colors['secondary-color-2']}8A, ${
          colors['secondary-color-2']
        }8A), url(${background})`
      }}
    >
      <div className={styles.inside_content}>
        <h1>GDLauncher Autoupdater</h1>
        We are currently updating the launcher, depending on your connection it
        may take a while. Go grab a cup of coffee while we finish this for you
        <Progress style={{ marginTop: 70 }} percent={percentage} />
      </div>
    </div>
  );
};
