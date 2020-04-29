import React, { useEffect, memo, useState } from 'react';
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
  transition: transform 0.2s;
  transition-timing-function: cubic-bezier(0.165, 0.84, 0.44, 1);
  will-change: transform;
`;

function DesktopRoot() {
  const dispatch = useDispatch();
  const currentAccount = useSelector(_getCurrentAccount);
  const clientToken = useSelector(state => state.app.clientToken);
  const javaPath = useSelector(state => state.settings.java.path);
  const location = useSelector(state => state.router.location);
  const modals = useSelector(state => state.modals);
  const shouldShowDiscordRPC = useSelector(state => state.settings.discordRPC);
  const [contentStyle, setContentStyle] = useState({ transform: 'scale(1)' });

  message.config({
    top: 45
  });

  const init = async () => {
    const userDataStatic = await ipcRenderer.invoke('getUserData');
    const userData = dispatch(updateUserData(userDataStatic));
    await dispatch(checkClientToken());
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

  useEffect(() => {
    if (
      modals[0] &&
      modals[0].modalType === 'Settings' &&
      !modals[0].unmounting
    ) {
      setContentStyle({ transform: 'scale(0.4)' });
    } else {
      setContentStyle({ transform: 'scale(1)' });
    }
  }, [modals]);

  return (
    <Wrapper>
      <SystemNavbar />
      <Container style={contentStyle}>
        <GlobalStyles />
        <RouteBackground />
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
