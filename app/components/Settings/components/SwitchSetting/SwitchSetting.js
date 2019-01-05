import React from 'react';
import { Switch, Divider, Icon } from 'antd';
import styles from './SwitchSetting.scss';

const SwitchSetting = (props) => {
  return (
    <div>
      <div className={styles.container}>
        <div>
          <div className={styles.mainText}>{props.mainText} <Icon type={props.icon || "robot"} theme="filled" /></div>
          <div className={styles.description}>{props.description}</div>
        </div>
        <div className={styles.action}>
          <Switch checked={props.checked} onChange={props.onChange} />
        </div>
      </div>
      <hr />
    </div>

  );
};

export default SwitchSetting;