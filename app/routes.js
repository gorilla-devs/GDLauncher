/* eslint flowtype-errors/show-errors: 0 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Switch, Route, withRouter, Redirect } from 'react-router';
import { Form } from 'antd';
import { bindActionCreators } from 'redux';
import * as AuthActions from './actions/auth';
import App from './containers/App';
import HomePage from './components/Home/containers/HomePage';
import SideBar from './components/Common/SideBar/SideBar';
import DManager from './components/DManager/containers/DManagerPage';
import Profile from './containers/ProfilePage';
import Navigation from './containers/Navigation';
import SysNavBar from './components/Common/SystemNavBar/SystemNavBar';
import Login from './components/Login/Login';
import Settings from './components/Settings/Settings';
import DiscordModal from './components/DiscordModal/DiscordModal';
import VanillaModal from './components/VanillaModal/containers/VanillaModal';
import loginHelperModal from './components/LoginHelperModal/LoginHelperModal';


class RouteDef extends React.Component {

  previousLocation = this.props.location;

  componentDidMount = () => {
    this.props.checkLocalDataValidity(true);
  }


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
        <SysNavBar />
        {location.pathname !== '/' && location.pathname !== '/loginHelperModal' ?
          <div>
            <Navigation />
            <SideBar />
          </div>
          : null}
        <Switch location={isModal ? this.previousLocation : location}>
          <Route exact path="/" component={Form.create()(Login)} />
          {!this.props.isAuthValid && <Redirect push to="/" />}
          <Route path="/dmanager" component={DManager} />
          <Route path="/profile" component={Profile} />
          <Route path="/home" component={HomePage} />
        </Switch>

        { /* ALL MODALS */}
        <Switch>
          {isModal ? <Route path="/settings" component={Settings} /> : null}
          {isModal ? <Route path="/discord" component={DiscordModal} /> : null}
          {isModal ? <Route path="/vanillaModal" component={VanillaModal} /> : null}
          {isModal ? <Route path="/loginHelperModal" component={loginHelperModal} /> : null}
        </Switch>
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

function mapDispatchToProps(dispatch) {
  return bindActionCreators(AuthActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(RouteDef);
