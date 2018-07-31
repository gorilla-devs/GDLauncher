import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button } from 'antd';
import Modal from '../Common/Modal/Modal';
import styles from './Settings.css';
import SideMenu from './components/SideMenu/SideMenu';

const Settings = ({ match, history }) => {
  return (
    <Modal history={history}>
      <SideMenu />
      Settings
    </Modal>
  );
};

export default Settings;