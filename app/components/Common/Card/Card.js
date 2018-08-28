import React from 'react';
import styles from './Card.scss';

const Card = props =>
  (
    <div className={styles.container} style={props.style}>
      <div className={styles.header}>
        {props.title || "Hello"}
      </div>
      <div className={styles.content}>
        {props.children}
      </div>
    </div>
  );

export default Card;
