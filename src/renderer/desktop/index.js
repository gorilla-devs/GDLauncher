import React, { memo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { Switch } from 'react-router';
import SystemNavbar from './components/SystemNavbar';
import routes from './routes';
import RouteWithSubRoutes from '../common/components/RouteWithSubRoutes';
import ModalsManager from '../common/components/ModalsManager';
import DesktopStyles from './components/DesktopStyles';

const DesktopRoot = () => {
  const modals = useSelector(state => state.modals);
  const [contentStyle, setContentStyle] = useState({ transform: 'scale(1)' });

  useEffect(() => {
    if (modals?.[0]?.modalType === 'Settings' && !modals?.[0].unmounting) {
      setContentStyle({ transform: 'scale(0.4)' });
    } else {
      setContentStyle({ transform: 'scale(1)' });
    }
  }, [modals]);

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
