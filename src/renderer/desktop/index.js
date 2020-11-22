import React, { memo, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import styled from 'styled-components';
import { Switch } from 'react-router';
import EV from 'src/common/messageEvents';
import SystemNavbar from './components/SystemNavbar';
import routes from './routes';
import RouteWithSubRoutes from '../common/components/RouteWithSubRoutes';
import ModalsManager from '../common/components/ModalsManager';
import DesktopStyles from './components/DesktopStyles';
import sendMessage from './helpers/sendMessage';
import {
  initAccounts,
  initNews,
  loginThroughNativePlatform,
  loginWithAccessToken
} from '../common/reducers/actions';
import { load, received, requesting } from '../common/reducers/loading/actions';
import features from '../common/reducers/loading/features';

const DesktopRoot = () => {
  const dispatch = useDispatch();
  const modals = useSelector(state => state.modals);
  const [contentStyle, setContentStyle] = useState({ transform: 'scale(1)' });
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      dispatch(requesting(features.checkingAccount));

      // Init accounts
      const accounts = await sendMessage(EV.AUTH.GET_ALL_ACCOUNTS);
      const currentAccountId = await sendMessage(
        EV.AUTH.GET_CURRENT_ACCOUNT_ID
      );
      dispatch(initAccounts(accounts, currentAccountId));
      dispatch(initNews());

      if (
        process.env.NODE_ENV === 'development' &&
        accounts[currentAccountId]
      ) {
        dispatch(received(features.checkingAccount));
        dispatch(push('/home'));
      } else if (accounts[currentAccountId]) {
        dispatch(
          load(features.checkingAccount, dispatch(loginWithAccessToken(true)))
        );
      } else {
        dispatch(
          load(
            features.checkingAccount,
            dispatch(loginThroughNativePlatform(true))
          )
        ).catch(console.error);
      }

      setInitialized(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (modals?.[0]?.modalType === 'Settings' && !modals?.[0].unmounting) {
      setContentStyle({ transform: 'scale(0.4)' });
    } else {
      setContentStyle({ transform: 'scale(1)' });
    }
  }, [modals]);

  if (!initialized) return null;

  return (
    <>
      <DesktopStyles />
      <SystemNavbar />
      <Container style={contentStyle}>
        <ModalsManager />
        <Switch>
          {routes.map((route, i) => (
            <RouteWithSubRoutes key={i} {...route} /> // eslint-disable-line
          ))}
        </Switch>
      </Container>
    </>
  );
};

export default memo(DesktopRoot);

const Container = styled.div`
  position: relative;
  width: 100%;
  height: calc(100% - ${({ theme }) => theme.sizes.height.systemNavbar}px);
`;
