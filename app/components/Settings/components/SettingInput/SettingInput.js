import React from 'react';
import { Switch, Divider, Icon, InputNumber } from 'antd';
import styles from './SettingInput.scss';

const SettingInput = props => {
  return (
    <div>
      <div className={styles.container}>
        <div>
          <div className={styles.mainText}>
            {props.mainText}{' '}
            <Icon type={props.icon || 'robot'} theme="filled" />
          </div>
          <div className={styles.description}>{props.description}</div>
        </div>
        <div className={styles.action}>
          <InputNumber min={1} max={10} />
        </div>
      </div>
      <Divider />
    </div>
  );
};

export default SettingInput;
