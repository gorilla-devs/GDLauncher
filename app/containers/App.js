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
  getJavaPath,
  updateIsUpdateAvailable
} from 'reducers/actions';
import routes from 'app/routes';
import { ipcRenderer } from 'electron';
import { load } from 'reducers/loading/actions';
import features from 'reducers/loading/features';
import ga from 'app/GAnalytics';
import GlobalStyles from 'app/globalStyles';
import 'app/app.global.scss';
import SideBar from 'app/components-new/common/Sidebar';
import Navigation from 'app/components-new/common/Navbar';
import SysNavBar from 'app/components-new/common/SystemNavbar';
import { isGlobalJavaOptions } from 'app/utils/java';
import ModalsManager from 'app/components-new/common/ModalsManager';
import background from '../assets/images/fullHdBackground.jpg';

const Wrapper = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  .switch-wrapper {
    position: relative;
    width: calc(
      100% -
        ${props =>
          props.isFullScreenPage
            ? '0px'
            : `${props.theme.sizes.width.sidebar} - 40px`}
    );
    height: calc(
      100% -
        ${props =>
          props.isFullScreenPage
            ? '0px'
            : `${props.theme.sizes.height.systemNavbar} - 20px - ${props.theme.sizes.height.navbar}`}
    );
    margin: ${props => (props.isFullScreenPage ? 0 : 20)}px;
    margin-top: ${props => (props.isFullScreenPage ? 0 : 10)}px;
  }

  .switch-wrapper > div {
    position: absolute;
    width: 100%;
    height: 100%;
  }
`;

const GlobalBackground = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: url(${background});
`;

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

const App = () => {
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
    // Check for updates
    if (process.env.NODE_ENV !== 'development') {
      ipcRenderer.send('check-for-updates');
      ipcRenderer.on('update-available', () => {
        dispatch(updateIsUpdateAvailable(true));
      });
    }
    dispatch(checkClientToken());
    ga.setUserId(clientToken);
    Promise.all([
      dispatch(initNews()),
      dispatch(initInstances()),
      dispatch(initManifests())
    ]).catch(log.error);
    // if (process.env.NODE_ENV === 'development' && currentAccountId) {
    //   dispatch(received(features.accountAuthentication));
    //   dispatch(push('/home'));
    // }
    if (!isAccountValid && currentAccountId) {
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
    location.pathname === '/' ||
    location.pathname === '/autoUpdate' ||
    location.pathname === '/newUserPage';

  return (
    <Wrapper isFullScreenPage={isFullScreenPage}>
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
