import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button } from 'antd';
import styles from './Content.scss';
import MyAccount_Preferences from '../MyAccount_Preferences/MyAccount_Preferences';

const Content = ({ match }) => {
  console.log(match);
  return (
    <div className={styles.Content}>
      <Route path={`/settings/myAccount_Preferences`} component={MyAccount_Preferences} />
    </div>
  );
};

export default Content;