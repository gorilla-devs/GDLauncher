/* eslint flowtype-errors/show-errors: 0 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Switch, Route, withRouter, Redirect } from 'react-router';
import { AnimatedSwitch } from 'react-router-transition';
import { Form } from 'antd';
import App from './containers/App';
import HomePage from './containers/HomePage';
import SideBar from './components/Common/SideBar/SideBar';
import DManager from './containers/DManagerPage';
import Profile from './containers/ProfilePage';
import Navigation from './containers/Navigation';
import Login from './components/Login/Login';
import Settings from './components/Settings/Settings';


class RouteDef extends React.Component {

  previousLocation = this.props.location;

  componentWillUpdate(nextProps) {
    const { location } = this.props;
    // set previousLocation if props.location is not modal
    if (
      nextProps.history.action !== "POP" &&
      (!location.state || !location.state.modal)
    ) {
      this.previousLocation = this.props.location;
    }
  }

  render() {
    const { location } = this.props;
    const isModal = !!(
      location.state &&
      location.state.modal &&
      this.previousLocation !== location
    ); // not initial render
    return (
      <App>
        <Navigation />
        <SideBar />
        <Switch location={isModal ? this.previousLocation : location}>
          <Route exact path="/" component={Form.create()(Login)} />
          {!this.props.isAuthValid && <Redirect push to="/" />}
          <Route path="/dmanager" component={DManager} />
          <Route path="/profile" component={Profile} />
          <Route path="/home" component={HomePage} />
        </Switch>
        { /* I really don't know how this works. A better solution should be found */}
        {isModal ? <Route path="/settings" component={Settings} /> : null}
      </App>
    );
  }
};

function mapStateToProps(state) {
  return {
    location: state.router.location,
    isAuthValid: state.auth.isAuthValid
  };
}

export default connect(mapStateToProps)(RouteDef);
