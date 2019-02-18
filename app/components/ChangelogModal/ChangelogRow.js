import React from 'react';
import styles from './ChangelogModal.scss';

export default props => {
  return (
    <li>
      <span className={styles.summary}>
        {props.main}
      </span>{' '}
      {props.secondary}
    </li>
  );
};
