import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button } from 'antd';
import styles from './Content.scss';

const Content = () => {
  return (
    <div className={styles.Content}>
      <div style={{ width: '100%', height: '100px', background: 'rgb(35, 48, 61)' }}>

      </div>
    </div>
  );
};

export default Content;