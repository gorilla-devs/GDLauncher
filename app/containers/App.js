// @flow
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch } from 'react-router';
import { push } from 'connected-react-router';
import { notification } from 'antd';
import { AnimatedSwitch } from 'react-router-transition';
import log from 'electron-log';
import styled from 'styled-components';
import { JAVA_URL } from 'app/constants';
import {
  initInstances,
  initNews,
  loginWithAccessToken,
  initManifests,
  checkClientToken,
  getJavaPath
} from 'reducers/actions';
import routes from 'app/routes';
import { load, received } from 'reducers/loading/actions';
import features from 'reducers/loading/features';
import ga from 'app/GAnalytics';
import GlobalStyles from 'app/globalStyles';
import 'app/app.global.scss';
import SideBar from 'app/components-new/common/sidebar';
import Navigation from 'app/components-new/common/navbar';
import SysNavBar from 'app/components-new/common/systemNavbar';
import { isGlobalJavaOptions } from 'app/utils/java';
import ModalsManager from 'app/components/Common/ModalsManager';

const Wrapper = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  .switch-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .switch-wrapper > div {
    position: absolute;
    width: 100%;
    height: 100%;
  }
`;

const RouteContainer = styled.div`
  position: relative;
  width: calc(100% - ${props => props.theme.sidebarWidth});
  height: 100%;
`;

const GlobalBackground = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: green;
`;

function RouteWithSubRoutes(route) {
  return (
    <RouteContainer>
      <Route
        path={route.path}
        render={props => (
          // pass the sub-routes down to keep nesting
          <route.component {...props} routes={route.routes} />
        )}
      />
    </RouteContainer>
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
    } else if (!isAccountValid && currentAccountId) {
      dispatch(
        load(features.accountAuthentication, dispatch(loginWithAccessToken()))
      );
    } else if (!isAccountValid && !currentAccountId) {
      dispatch(push('/'));
    }
    dispatch(getJavaPath())
      .then(result => {
        if (!result) {
          return notification.warning({
            duration: 0,
            message: 'JAVA NOT FOUND',
            description: (
              <div>
                Java has not been found. Click{' '}
                <a href={JAVA_URL} target="_blank" rel="noopener noreferrer">
                  here
                </a>{' '}
                to download it. After installing you will need to restart your
                PC.
              </div>
            )
          });
        }
        return null;
      })
      .catch(log.error);
    isGlobalJavaOptions(dispatch)
      .then(result => setGlobalJavaOptions(result))
      .catch(log.error);
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
    <Wrapper>
      <GlobalStyles />
      <SysNavBar />
      <GlobalBackground />
      <ModalsManager />
      {!isFullScreenPage && (
        <>
          <Navigation />
          <SideBar />
        </>
      )}
      <AnimatedSwitch
        atEnter={{ opacity: 0 }}
        atLeave={{ opacity: 0 }}
        atActive={{ opacity: 1 }}
        className="switch-wrapper"
      >
        {routes.map((route, i) => (
          <RouteWithSubRoutes key={i} {...route} />
        ))}
      </AnimatedSwitch>
    </Wrapper>
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
