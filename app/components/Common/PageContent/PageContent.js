import React from 'react';
import { Route } from 'react-router';
import HomePage from '../../..//components/Home/containers/HomePage';
import DManager from '../../..//components/DManager/containers/DManagerPage';
import Profile from '../../..//containers/ProfilePage';
import ServerManager from '../../ServerManager/ServerManager';
import styles from './PageContent.scss';

const Container = props =>
  (
    <div className={styles.container}>
      <Route path="/dmanager" component={DManager} />
      <Route path="/profile" component={Profile} />
      <Route path="/home" component={HomePage} />
      <Route path="/serverManager" component={ServerManager} />
    </div>
  );

export default Container;
