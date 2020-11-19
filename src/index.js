import React, { memo } from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import 'inter-ui';
import Renderer from './renderer';
import theme from './renderer/common/theme';
import storeConfig from './renderer/common/store';

window.__store = storeConfig.store;

const MainRoot = memo(() => {
  return (
    <Provider store={storeConfig.store}>
      <ConnectedRouter history={storeConfig.history}>
        <StyledThemeProvider theme={theme}>
          <Renderer />
        </StyledThemeProvider>
      </ConnectedRouter>
    </Provider>
  );
});

ReactDOM.render(<MainRoot />, document.getElementById('root'));
