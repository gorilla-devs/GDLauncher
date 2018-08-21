import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button } from 'antd';
import styles from './MenuItem.scss';

const MenuItem = (props) => {
  return (
    <Link to={{
      pathname: `/settings/${props.to}`,
      state: { modal: true }
    }}
    replace>
      <div className={styles.menuItem} style={{ background: props.active ? '#2980b9' : '' }}>
        {props.children}
      </div>
    </Link>
  );
};

export default MenuItem;