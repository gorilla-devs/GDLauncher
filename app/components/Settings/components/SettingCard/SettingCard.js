import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button } from 'antd';
import styles from './SettingCard.scss';

const SettingCard = (props) => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>
        {props.title || null}
      </div>
      <div>
        {props.children}
      </div>
    </div>
  );
};

export default SettingCard;