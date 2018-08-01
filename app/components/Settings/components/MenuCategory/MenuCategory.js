import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button } from 'antd';
import styles from './MenuCategory.scss';

const MenuItem = (props) => {
  return (
    <div className={styles.menuItem}>
      {props.children}
    </div>
  );
};

export default MenuItem;