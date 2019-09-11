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
import Settings from './components/Settings/Settings';
import CurseModpacksBrowser from './components/CurseModpacksBrowser/CurseModpacksBrowser';
import { ModalManager } from './components/Common/ModalManager/ModalManager';

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
  const clientToken = useSelector(state => state.app.clientToken);
  const dispatch = useDispatch();
  const appVersion = require('../package.json').version;

  useEffect(() => {
    dispatch(checkClientToken());
    ga.setUserId(uuid);
    Promise.all(
      dispatch(initNews()),
      dispatch(initInstances()),
      dispatch(initManifests())
    );
    if (!isAccountValid) {
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
    if (location.pathname === '/home' && showChangelog) {
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
        {location.pathname !== '/' &&
          location.pathname !== '/newUserPage' &&
          location.pathname !== '/loginHelperModal' && (
            <div>
              <Navigation />
              <SideBar />
            </div>
          )}
        <ModalManager />
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
      {/* ALL MODALS */}
      {isModal ? <Route path="/settings/:page" component={Settings} /> : null}
      {isModal ? (
        <Route
          path="/InstanceCreatorModal"
          component={WaitingComponent(InstanceCreatorModal)}
        />
      ) : null}
      {isModal ? (
        <Route
          path="/curseModpackBrowserCreatorModal/:addonID"
          component={WaitingComponent(CurseModpacksBrowserCreatorModal)}
        />
      ) : null}
      {isModal ? (
        <Route
          path="/curseModpackExplorerModal/:addonID"
          component={WaitingComponent(CurseModpackExplorerModal)}
        />
      ) : null}
      {isModal ? (
        <Route
          path="/editInstance/:instance/:page/:state?/:version?/:mod?"
          component={InstanceManagerModal}
        />
      ) : null}
      {isModal ? (
        <Route path="/importPack" component={WaitingComponent(ImportPack)} />
      ) : null}
      {isModal ? (
        <Route
          path="/exportPackModal/:instanceName"
          component={WaitingComponent(ExportPackModal)}
        />
      ) : null}
      {isModal ? (
        <Route
          path="/loginHelperModal"
          component={WaitingComponent(loginHelperModal)}
        />
      ) : null}
      {isModal ? (
        <Route
          path="/changelogs"
          component={WaitingComponent(ChangelogsModal)}
        />
      ) : null}
      {isModal ? (
        <Route
          path="/confirmInstanceDelete/:type/:name"
          component={WaitingComponent(ConfirmDeleteModal)}
        />
      ) : null}
      {isModal ? (
        <Route
          path="/javaGlobalOptionsFix"
          component={WaitingComponent(JavaGlobalOptionsFixModal)}
        />
      ) : null}
    </App>
  );
};

function WaitingComponent(MyComponent) {
  return props => (
    <Suspense
      fallback={
        <div
          style={{
            width: '100vw',
            height: '100vh',
            background: 'var(--secondary-color-1)'
          }}
        >
          Loading...
        </div>
      }
    >
      <MyComponent {...props} />
    </Suspense>
  );
}

export default RouteDef;
