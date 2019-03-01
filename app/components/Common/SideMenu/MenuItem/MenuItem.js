import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button } from 'antd';
import styles from './MenuItem.scss';

const MenuItem = props => {
  return (
    <Link
      to={{
        pathname: props.to,
        state: { modal: true }
      }}
      replace
      style={{
        textDecoration: 'none'
      }}
    >
      <div
        className={`${styles.menuItem} ${props.active ? styles.active : null}`}
      >
        {props.children}
      </div>
    </Link>
  );
};

export default MenuItem;
