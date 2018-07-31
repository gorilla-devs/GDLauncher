import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button } from 'antd';
import Modal from '../Common/Modal/Modal';
import styles from './Settings.css';
import SideMenu from './components/SideMenu/SideMenu';
import Content from './components/Content/Content';

const Settings = ({ match, history }) => {
  return (
    <Modal history={history}>
      <div className={styles.container}>
        <SideMenu />
        <Content />
      </div>
    </Modal>
  );
};

export default Settings;