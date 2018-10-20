import React from 'react';
import { Route } from 'react-router';
import HomePage from '../../Home/containers/HomePage';
import DManager from '../../DManager/containers/DManagerPage';
import ServerManager from '../../ServerManager/ServerManager';
import styles from './PageContent.scss';

const Container = props =>
  (
    <div className={styles.container}>
      <Route path="/dmanager" component={DManager} />
      <Route path="/home" component={HomePage} />
      <Route path="/serverManager" component={ServerManager} />
    </div>
  );

export default Container;
