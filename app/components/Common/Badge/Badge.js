import React from 'react';
import styles from './Badge.scss';

const Badge = props => (
  <div>
    {props.children}
    {(props.invisible === undefined || props.invisible !== true) && (
      <div className={styles.container}>{props.count}</div>
    )}
  </div>
);

export default Badge;
