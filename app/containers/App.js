// @flow
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch } from 'react-router';
import { push } from 'connected-react-router';
import { notification } from 'antd';
import log from 'electron-log';
import { JAVA_URL } from 'App/constants';
import {
  initInstances,
  initNews,
  loginWithAccessToken,
  initManifests,
  checkClientToken,
  getJavaPath
} from 'Reducers/actions';
import routes from 'App/routes';
import { load, received } from 'Reducers/loading/actions';
import features from 'Reducers/loading/features';
import ga from 'App/GAnalytics';
import GlobalStyles from 'App/globalStyles';
import 'App/app.global.scss';
import SideBar from 'App/components-new/common/sidebar';
import Navigation from 'App/components-new/common/navbar';
import SysNavBar from 'App/components-new/common/systemNavbar';
import { isGlobalJavaOptions } from 'App/utils/java';
import ModalsManager from 'App/components/Common/ModalsManager';

function RouteWithSubRoutes(route) {
  return (
    <Route
      path={route.path}
      render={props => (
        // pass the sub-routes down to keep nesting
        <route.component {...props} routes={route.routes} />
      )}
    />
  );
}

const App = ({ children }) => {
  const [globalJavaOptions, setGlobalJavaOptions] = useState(false);
  const isAccountValid = useSelector(
    state => state.loading.accountAuthentication.isReceived
  );
  const location = useSelector(state => state.router.location);
  const currentAccountId = useSelector(state => state.app.currentAccountId);
  const showChangelogs = useSelector(state => state.app.showChangelogs);
  const clientToken = useSelector(state => state.app.clientToken);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkClientToken());
    ga.setUserId(clientToken);
    Promise.all([
      dispatch(initNews()),
      dispatch(initInstances()),
      dispatch(initManifests())
    ]).catch(log.error);
    if (process.env.NODE_ENV === 'development' && currentAccountId) {
      dispatch(received(features.accountAuthentication));
      dispatch(push('/home'));
    } else {
      if (!isAccountValid && currentAccountId) {
        dispatch(
          load(features.accountAuthentication, dispatch(loginWithAccessToken()))
        );
      } else if (!isAccountValid && !currentAccountId) {
        dispatch(push('/'));
      }
    }
    dispatch(getJavaPath()).then(result => {
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
    isGlobalJavaOptions(dispatch).then(result => setGlobalJavaOptions(result));
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
        push({
          pathname: `/changelogs`
        });
      }, 200);
    }
  }, [globalJavaOptions, location.pathname]);

  const isFullScreenPage =
    location.pathname === '/' &&
    location.pathname === '/autoUpdate' &&
    location.pathname === '/newUserPage';

  return (
    <>
      <GlobalStyles />
      <SysNavBar />
      <ModalsManager />
      {!isFullScreenPage && (
        <>
          <Navigation />
          <SideBar />
        </>
      )}
      <Switch>
        {routes.map((route, i) => (
          <RouteWithSubRoutes key={i} {...route} />
        ))}
      </Switch>
    </>
  );
};

export default () => {
  // Return strict mode only in development
  if (process.env.NODE_ENV === 'development')
    return (
      <React.StrictMode>
        <>
          <App />
        </>
      </React.StrictMode>
    );
  // In production return only the children
  return (
    <>
      <App />
    </>
  );
};
