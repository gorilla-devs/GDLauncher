import React from 'react';
import { Switch, Divider } from 'antd';
import styles from './SwitchSetting.scss';

const SwitchSetting = (props) => {
  return (
    <div>
      <div className={styles.container}>
        <div>
          <div className={styles.mainText}>{props.mainText}</div>
          <div className={styles.description}>{props.description}</div>
        </div>
        <div className={styles.action}>
          <Switch />
        </div>
      </div>
      <Divider />
    </div>

  );
};

export default SwitchSetting;