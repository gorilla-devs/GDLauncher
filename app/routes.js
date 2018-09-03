/* eslint flowtype-errors/show-errors: 0 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Switch, Route, withRouter, Redirect } from 'react-router';
import { Form, notification, Button } from 'antd';
import { bindActionCreators } from 'redux';
import * as AuthActions from './actions/auth';
import { JAVA_URL } from './constants';
import App from './containers/App';
import PageContent from './components/Common/PageContent/PageContent';
import HomePage from './components/Home/containers/HomePage';
import SideBar from './components/Common/SideBar/SideBar';
import DManager from './components/DManager/containers/DManagerPage';
import Navigation from './containers/Navigation';
import SysNavBar from './components/Common/SystemNavBar/SystemNavBar';
import Login from './components/Login/Login';
import findJava from './utils/javaLocationFinder';
import Settings from './components/Settings/Settings';
import DiscordModal from './components/DiscordModal/DiscordModal';
import InstanceCreatorModal from './components/InstanceCreatorModal/containers/InstanceCreatorModal';
import InstanceManagerModal from './components/InstanceManagerModal/containers/InstanceManagerModal';
import loginHelperModal from './components/LoginHelperModal/LoginHelperModal';

type Props = {
  location: Object,
  checkAccessToken: () => void,
  isAuthValid: boolean
};

class RouteDef extends Component<Props> {
  componentDidMount = async () => {
    this.props.checkAccessToken();
    try {
      await findJava();
    } catch (err) {
      notification.warning({
        duration: 0,
        message: 'JAVA NOT FOUND',
        description: (
          <div>
            Java has not been found. Click <a href={JAVA_URL} target="_blank" rel="noopener noreferrer">here</a> to
            download it. After installing you will need to restart your PC.
          </div>
        )
      });
    }
  }


  componentWillUpdate(nextProps) {
    const { location } = this.props;
    // set previousLocation if props.location is not modal
    if (
      nextProps.history.action !== 'POP' &&
      (!location.state || !location.state.modal)
    ) {
      this.previousLocation = this.props.location;
    }
  }

  previousLocation = this.props.location;

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
          <Route component={PageContent} />
        </Switch>

        { /* ALL MODALS */}
        {isModal ? <Route path="/settings/:page" component={Settings} /> : null}
        {isModal ? <Route path="/discord" component={DiscordModal} /> : null}
        {isModal ? <Route path="/InstanceCreatorModal" component={InstanceCreatorModal} /> : null}
        {isModal ? <Route path="/editInstance/:instance" component={InstanceManagerModal} /> : null}
        {isModal ? <Route path="/loginHelperModal" component={loginHelperModal} /> : null}
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
