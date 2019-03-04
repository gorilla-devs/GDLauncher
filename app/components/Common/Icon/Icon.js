import React from 'react';
import styles from './Icon.scss';

const Icon = props => (
  <div
    className={styles.container}
    style={{ height: props.size, width: props.size }}
  >
    <div className={styles.content}>{props.children || 'P'}</div>
  </div>
);

export default Icon;
