import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button } from 'antd';
import Modal from '../Common/Modal/Modal';
import styles from './Settings.css';
import SideMenu from './components/SideMenu/SideMenu';
import Content from './components/Content/Content';

const Settings = ({ match, history }) => {
  return (
    <Modal
      history={history}
      header="false"
      style={{ width: '100%', height: '100%', left: '0' }}
      backBtn={
        <Button icon="close" size="large" type="ghost" style={{ position: 'absolute', right: '5%', top: '5%' }} />
      }
    >
      <div className={styles.container}>
        <SideMenu match={match} />
        <Content match={match} />
      </div>
    </Modal>
  );
};

export default Settings;