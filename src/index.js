import React, { memo } from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import 'inter-ui';
import Renderer from './renderer';
import theme from './renderer/common/theme';
import configureStore from './renderer/common/store';

const store = configureStore.configureStore();
window.__store = store;

const MainRoot = memo(() => {
  return (
    <Provider store={store}>
      <ConnectedRouter history={configureStore.history}>
        <StyledThemeProvider theme={theme}>
          <Renderer />
        </StyledThemeProvider>
      </ConnectedRouter>
    </Provider>
  );
});

ReactDOM.render(<MainRoot />, document.getElementById('root'));
