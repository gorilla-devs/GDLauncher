import React, { useEffect, memo } from 'react';
import { useDidMount } from 'rooks';
import styled from 'styled-components';
import { Switch } from 'react-router';
import { ipcRenderer } from 'electron';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { message } from 'antd';
import RouteWithSubRoutes from '../../common/components/RouteWithSubRoutes';
import {
  loginWithAccessToken,
  initManifests,
  initNews,
  loginThroughNativeLauncher,
  switchToFirstValidAccount,
  checkClientToken,
  updateUserData
} from '../../common/reducers/actions';
import {
  load,
  received,
  requesting
} from '../../common/reducers/loading/actions';
import features from '../../common/reducers/loading/features';
import GlobalStyles from '../../common/GlobalStyles';
import RouteBackground from '../../common/components/RouteBackground';
import Navbar from './components/Navbar';
import ga from '../../common/utils/analytics';
import routes from './utils/routes';
import { _getCurrentAccount } from '../../common/utils/selectors';
import { isLatestJavaDownloaded, extract7z } from './utils';
import SystemNavbar from './components/SystemNavbar';
import useTrackIdle from './utils/useTrackIdle';
import { openModal } from '../../common/reducers/modals/actions';

const Wrapper = styled.div`
  height: 100vh;
  width: 100vw;
`;

const Container = styled.div`
  position: absolute;
  top: ${props => props.theme.sizes.height.systemNavbar}px;
  height: calc(100vh - ${props => props.theme.sizes.height.systemNavbar}px);
  width: 100vw;
  display: flex;
  flex-direction: column;
`;

function DesktopRoot() {
  const dispatch = useDispatch();
  const currentAccount = useSelector(_getCurrentAccount);
  const clientToken = useSelector(state => state.app.clientToken);
  const javaPath = useSelector(state => state.settings.java.path);
  const location = useSelector(state => state.router.location);
  const shouldShowDiscordRPC = useSelector(state => state.settings.discordRPC);

  message.config({
    top: 26
  });

  const init = async () => {
    const userDataStatic = await ipcRenderer.invoke('getUserData');
    const userData = dispatch(updateUserData(userDataStatic));
    dispatch(checkClientToken());
    dispatch(initNews());

    dispatch(requesting(features.mcAuthentication));

    const manifests = await dispatch(initManifests());
    await extract7z();
    const isLatestJava = await isLatestJavaDownloaded(manifests.java, userData);
    const isJavaOK = javaPath || isLatestJava;
    if (!isJavaOK) {
      dispatch(openModal('JavaSetup', { preventClose: true }));
    }

    if (process.env.NODE_ENV === 'development' && currentAccount) {
      dispatch(received(features.mcAuthentication));
      dispatch(push('/home'));
    } else if (currentAccount) {
      dispatch(
        load(features.mcAuthentication, dispatch(loginWithAccessToken()))
      ).catch(() => {
        dispatch(switchToFirstValidAccount());
      });
    } else {
      dispatch(
        load(features.mcAuthentication, dispatch(loginThroughNativeLauncher()))
      ).catch(console.error);
    }

    if (shouldShowDiscordRPC) {
      ipcRenderer.invoke('init-discord-rpc');
    }
  };

  // Handle already logged in account redirect
  useDidMount(init);

  useEffect(() => {
    if (clientToken && process.env.NODE_ENV !== 'development') {
      ga.setUserId(clientToken)
        .then(() => ga.trackPage(location.pathname))
        .catch(console.error);
    }
  }, [location.pathname, clientToken]);

  useTrackIdle(location.pathname);

  return (
    <Wrapper>
      <SystemNavbar />
      <Container>
        <GlobalStyles />
        <RouteBackground />
        <Navbar />
        <Switch>
          {routes.map((route, i) => (
            <RouteWithSubRoutes key={i} {...route} /> // eslint-disable-line
          ))}
        </Switch>
      </Container>
    </Wrapper>
  );
}

export default memo(DesktopRoot);
