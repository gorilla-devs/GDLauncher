import React from 'react';
import { Select, Divider, Icon } from 'antd';
import styles from './SelectSetting.scss';

const SelectSetting = props => {
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
          <Select
            style={{ width: 150 }}
            placeholder={props.placeholder || 'Select a value'}
            disabled={props.disabled || false}
            loading={props.loading || false}
            onChange={props.onChange || null}
            defaultValue={props.defaultValue}
          >
            {props.options.map(opt => (
              <Select.Option key={opt} value={opt}>
                {opt}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>
      <Divider />
    </div>
  );
};

export default SelectSetting;
