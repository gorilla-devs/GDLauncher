import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button } from 'antd';
import Modal from '../Common/Modal/Modal';
import styles from './Settings.css';

const Settings = ({ match, history }) => {
  return (
    <Modal history={history}>
      Contenuto
    </Modal>
  );
};

export default Settings;