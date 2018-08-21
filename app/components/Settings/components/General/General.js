import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button } from 'antd';
import styles from './General.scss';

const General = (props) => {
  return (
    <div>
      <div style={{ width: '100%', height: '100px', background: 'rgb(35, 48, 61)' }}>

      </div>
      Hello world
    </div>
  );
};

export default General;