import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button } from 'antd';
import styles from './Content.scss';
import General from '../General/General';

const Content = ({ match }) => {
  console.log(match);
  return (
    <div className={styles.Content}>
      <Route path={`/settings/general`} component={General} />
    </div>
  );
};

export default Content;