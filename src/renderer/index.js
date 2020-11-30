import React, { memo } from 'react';
import styled, {
  ThemeProvider as StyledThemeProvider
} from 'styled-components';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import 'inter-ui';
import GlobalStyles from './common/GlobalStyles';
import theme from './common/theme';
import configureStore from './common/store';
// eslint-disable-next-line
import Root from './_APP_TARGET_';

const store = configureStore.configureStore();
window.__store = store;

const RendererRoot = () => {
  return (
    <Provider store={store}>
      <ConnectedRouter history={configureStore.history}>
        <StyledThemeProvider theme={theme}>
          <GlobalStyles />
          <Container>
            <Root />
          </Container>
        </StyledThemeProvider>
      </ConnectedRouter>
    </Provider>
  );
};

export default memo(RendererRoot);

const Container = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
`;
