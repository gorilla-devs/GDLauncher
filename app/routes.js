/* eslint flowtype-errors/show-errors: 0 */
import React, { Component, lazy, Suspense, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router';
import { Form, notification } from 'antd';
import { bindActionCreators } from 'redux';
import { screen } from 'electron';
import {
  initInstances,
  initNews,
  loginWithAccessToken,
  initManifests,
  checkClientToken
} from './reducers/actions';
import { load } from './reducers/loading/actions';
import features from './reducers/loading/features';
import { JAVA_URL } from './constants';
import ga from './GAnalytics';
import GlobalStyles from './globalStyles';
import './app.global.scss';
import App from './containers/App';
import { history } from './store/configureStore';
import SideBar from './components/Common/SideBar/SideBar';
import Navigation from './components/Common/WindowNavigation/NavigationBar';
import SysNavBar from './components/Common/SystemNavBar/SystemNavBar';
import { findJavaHome, isGlobalJavaOptions } from './utils/javaHelpers';
import DManager from './components/DManager/DManager';
import InstanceManagerModal from './components/InstanceManagerModal/InstanceManagerModal';
import CurseModpacksBrowser from './components/CurseModpacksBrowser/CurseModpacksBrowser';
import ModalsManager from './components/Common/ModalsManager';

const Login = lazy(() => import('./components/Login/Login'));
const HomePage = lazy(() => import('./components/Home/Home'));
const AutoUpdate = lazy(() => import('./components/AutoUpdate/AutoUpdate'));
const NewUserPage = lazy(() => import('./components/NewUserPage/NewUserPage'));

const InstanceCreatorModal = lazy(() =>
  import('./components/InstanceCreatorModal/InstanceCreatorModal')
);

const loginHelperModal = lazy(() =>
  import('./components/LoginHelperModal/LoginHelperModal')
);
const CurseModpacksBrowserCreatorModal = lazy(() =>
  import(
    './components/CurseModpacksBrowserCreatorModal/CurseModpacksBrowserCreatorModal'
  )
);
const CurseModpackExplorerModal = lazy(() =>
  import('./components/CurseModpackExplorerModal/CurseModpackExplorerModal')
);
const ImportPack = lazy(() => import('./components/ImportPack/ImportPack'));
const ExportPackModal = lazy(() =>
  import('./components/ExportPackModal/ExportPackModal')
);
const ChangelogsModal = lazy(() =>
  import('./components/ChangelogModal/ChangelogModal')
);
const ConfirmDeleteModal = lazy(() =>
  import('./components/ConfirmDeleteModal/ConfirmDeleteModal')
);
const JavaGlobalOptionsFixModal = lazy(() =>
  import('./components/JavaGlobalOptionsFixModal/JavaGlobalOptionsFixModal')
);

const RouteDef = props => {
  const [globalJavaOptions, setGlobalJavaOptions] = useState(false);
  const isAccountValid = useSelector(
    state => state.loading.accountAuthentication.isReceived
  );
  const location = useSelector(state => state.router.location);
  const currentAccountId = useSelector(state => state.app.currentAccountId);
  const showChangelogs = useSelector(state => state.app.showChangelogs);
  const clientToken = useSelector(state => state.app.clientToken);
  const dispatch = useDispatch();
  const appVersion = require('../package.json').version;

  useEffect(() => {
    dispatch(checkClientToken());
    ga.setUserId(clientToken);
    Promise.all([
      dispatch(initNews()),
      dispatch(initInstances()),
      dispatch(initManifests())
    ]);
    if (!isAccountValid && currentAccountId) {
      dispatch(
        load(features.accountAuthentication, dispatch(loginWithAccessToken()))
      );
    }
    findJavaHome().then(result => {
      if (!result) {
        notification.warning({
          duration: 0,
          message: 'JAVA NOT FOUND',
          description: (
            <div>
              Java has not been found. Click{' '}
              <a href={JAVA_URL} target="_blank" rel="noopener noreferrer">
                here
              </a>{' '}
              to download it. After installing you will need to restart your PC.
            </div>
          )
        });
      }
    });
    isGlobalJavaOptions().then(result => setGlobalJavaOptions(result));
  }, []);

  useEffect(() => {
    if (isAccountValid && process.env.NODE_ENV !== 'development') {
      ga.trackPage(location.pathname);
    }
  }, [isAccountValid, location.pathname]);

  useEffect(() => {
    if (globalJavaOptions && location.pathname === '/home') {
      // Modal
      dispatch(
        push({
          pathname: `/javaGlobalOptionsFix`
        })
      );
      setGlobalJavaOptions(false);
    }
    /* Show the changelogs after an update */
    if (location.pathname === '/home' && showChangelogs) {
      setTimeout(() => {
        history.push({
          pathname: `/changelogs`
        });
      }, 200);
    }
  }, [globalJavaOptions, location.pathname]);

  return (
    <App>
      <GlobalStyles />
      <SysNavBar />
      <div>
        {isAccountValid &&
          location.pathname !== '/' &&
          location.pathname !== '/newUserPage' &&
          location.pathname !== '/loginHelperModal' && (
            <div>
              <Navigation />
              <SideBar />
            </div>
          )}
        <ModalsManager />
        <Switch location={location}>
          <Route
            exact
            path="/"
            component={WaitingComponent(Form.create()(Login))}
          />
          <Route
            exact
            path="/autoUpdate"
            component={WaitingComponent(AutoUpdate)}
          />
          {/* {!isAuthValid && <Redirect push to="/" />} */}
          <Route
            path="/newUserPage"
            component={WaitingComponent(NewUserPage)}
          />
          <Route>
            <div
              style={{
                width: 'calc(100% - 200px)',
                position: 'absolute',
                right: 200
              }}
            >
              <Route path="/dmanager" component={DManager} />
              <Route
                path="/curseModpacksBrowser"
                component={CurseModpacksBrowser}
              />
              <Route path="/home" component={WaitingComponent(HomePage)} />
            </div>
          </Route>
        </Switch>
      </div>
    </App>
  );
};

function WaitingComponent(MyComponent) {
  return props => (
    <Suspense fallback={null}>
      <MyComponent {...props} />
    </Suspense>
  );
}

export default RouteDef;
