import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button } from 'antd';
import styles from './Content.scss';
import MyAccount_Preferences from '../MyAccount_Preferences/MyAccount_Preferences';
import Instances from '../Instances/Instances';
import JavaManager from '../JavaManager/JavaManager';
import UserInterface from '../UserInterface/UserInterface';

const Content = ({ match }) => {
  return (
    <div className={styles.Content}>
      <div style={{ maxWidth: 700, width: '85%' }}>
        <Route
          path="/settings/myAccount_Preferences"
          component={MyAccount_Preferences}
        />
        <Route path="/settings/java" component={JavaManager} />
        <Route path="/settings/instances" component={Instances} />
        <Route path="/settings/ui" component={UserInterface} />
      </div>
    </div>
  );
};

export default Content;
