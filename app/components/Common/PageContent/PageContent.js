import React from 'react';
import { Switch, Route, withRouter, Redirect } from 'react-router';
import App from '../../../containers/App';
import HomePage from '../../..//components/Home/containers/HomePage';
import SideBar from '../../..//components/Common/SideBar/SideBar';
import DManager from '../../..//components/DManager/containers/DManagerPage';
import Profile from '../../..//containers/ProfilePage';
import Navigation from '../../..//containers/Navigation';
import SysNavBar from '../../..//components/Common/SystemNavBar/SystemNavBar';
import Login from '../../..//components/Login/Login';
import findJava from '../../..//utils/javaLocationFinder';
import Settings from '../../..//components/Settings/Settings';
import DiscordModal from '../../..//components/DiscordModal/DiscordModal';
import VanillaModal from '../../..//components/VanillaModal/containers/VanillaModal';
import loginHelperModal from '../../..//components/LoginHelperModal/LoginHelperModal';
import styles from './PageContent.scss';

const Container = props =>
  (
    <div className={styles.container}>
      <Route path="/dmanager" component={DManager} />
      <Route path="/profile" component={Profile} />
      <Route path="/home" component={HomePage} />
    </div>
  );

export default Container;
