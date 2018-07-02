import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button } from 'antd';
import styles from './Modal.css';

const Modal = ({ history, children }) => {
  const back = e => {
    e.stopPropagation();
    history.goBack();
  };
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 style={{ display: 'inline-block' }}>Settings</h3>
        <Button shape="circle" icon="close" size="large" className={styles.closeBtn} onClick={back} />
        <div className={styles.modalContent}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;