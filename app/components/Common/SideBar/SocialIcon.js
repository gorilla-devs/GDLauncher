import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './SocialIcon.scss';

export default props => {
  return (
    <a
      href={props.url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.socialBtn}
    >
      <FontAwesomeIcon icon={props.icon} />
    </a>
  );
};
