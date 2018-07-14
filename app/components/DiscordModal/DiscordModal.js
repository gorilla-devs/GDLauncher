import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button } from 'antd';
import Modal from '../Common/Modal/Modal';
import styles from './DiscordModal.css';

const DiscordModal = ({ match, history }) => {
  return (
    <Modal history={history}>
      <iframe
        title="discordwidget"
        src="https://discordapp.com/widget?id=398091532881756161&theme=dark"
        frameBorder="0"
        style={{ width: '100%', height: '78vh' }}
      />
    </Modal>
  );
};

export default DiscordModal;
