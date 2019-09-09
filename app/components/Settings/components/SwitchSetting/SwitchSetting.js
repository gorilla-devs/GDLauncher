import React from 'react';
import { Switch, Divider, Icon } from 'antd';
import styles from './SwitchSetting.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const SwitchSetting = props => {
  return (
    <div>
      <div className={styles.container}>
        <div>
          <div className={styles.mainText}>
            {props.mainText}{' '}
            <FontAwesomeIcon icon={props.icon} />
          </div>
          <div className={styles.description}>{props.description}</div>
        </div>
        <div className={styles.action}>
          <Switch checked={props.checked} onChange={props.onChange} />
        </div>
      </div>
      <Divider />
    </div>
  );
};

export default SwitchSetting;
