import React, { memo, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import styled from 'styled-components';
import { Switch } from 'react-router';
import { DB_SCHEMA } from 'src/common/persistedKeys';
import SystemNavbar from './components/SystemNavbar';
import routes from './routes';
import RouteWithSubRoutes from '../common/components/RouteWithSubRoutes';
import ModalsManager from '../common/components/ModalsManager';
import DesktopStyles from './components/DesktopStyles';
import { initNews, initStoreFromMain } from '../common/reducers/actions';
import { load, received, requesting } from '../common/reducers/loading/actions';
import features from '../common/reducers/loading/features';
import fetchStoreValues from './helpers/fetchStoreValues';
import {
  loginThroughNativeLauncher,
  loginWithAccessToken
} from '../common/reducers/authActions';

const DesktopRoot = () => {
  const dispatch = useDispatch();
  const modals = useSelector(state => state.modals);
  const [contentStyle, setContentStyle] = useState({ transform: 'scale(1)' });
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      dispatch(requesting(features.checkingAccount));

      const storeValues = await fetchStoreValues();

      dispatch(initStoreFromMain(storeValues));
      dispatch(initNews());
      const accounts = storeValues[DB_SCHEMA.persisted.accounts];
      const currentAccountId =
        storeValues[DB_SCHEMA.persisted.currentAccountId];

      const account = accounts.find(
        v => v.selectedProfile.id === currentAccountId
      );

      setInitialized(true);
      if (process.env.NODE_ENV === 'development' && account) {
        dispatch(received(features.checkingAccount));
        dispatch(push('/home'));
      } else if (account) {
        dispatch(
          load(features.checkingAccount, dispatch(loginWithAccessToken(true)))
        );
      } else {
        dispatch(
          load(
            features.checkingAccount,
            dispatch(loginThroughNativeLauncher(true))
          )
        ).catch(console.error);
      }
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
