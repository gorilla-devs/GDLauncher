import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button } from 'antd';
import styles from './Content.scss';
import MyAccount from '../MyAccount/MyAccount';

const Content = ({ match }) => {
  console.log(match);
  return (
    <div className={styles.Content}>
      <Route path={`/settings/myAccount`} component={MyAccount} />
    </div>
  );
};

export default Content;