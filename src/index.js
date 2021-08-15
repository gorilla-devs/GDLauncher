import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { PersistGate } from 'redux-persist/integration/react';
import { ConnectedRouter } from 'connected-react-router';
import { configureStore, history } from './common/store/configureStore';
import theme from './ui/theme';
import RootDev from './Root-Dev';
import RootWeb from './Root-Web';
import RootElectron from './Root-Electron';
import ModalsManager from './common/components/ModalsManager';

import 'typeface-roboto';
import 'inter-ui';
import ErrorBoundary from './common/ErrorBoundary';

const Root =
  // eslint-disable-next-line no-nested-ternary
  process.env.NODE_ENV === 'development'
    ? RootDev
    : process.env.APP_TYPE === 'web'
    ? RootWeb
    : RootElectron;

const ThemeProvider = ({ theme: themeUI, children }) => {
  return <StyledThemeProvider theme={themeUI}>{children}</StyledThemeProvider>;
};

const { store, persistor } = configureStore();

window.__store = store;

window.addEventListener('mouseup', e => {
  if (e.button === 3 || e.button === 4 || e.button === 1) {
    e.preventDefault();
  }
});

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ThemeProvider theme={theme}>
        <ConnectedRouter history={history}>
          <ErrorBoundary>
            <ModalsManager />
            <Root history={history} store={store} persistor={persistor} />
          </ErrorBoundary>
        </ConnectedRouter>
      </ThemeProvider>
    </PersistGate>
  </Provider>,
  document.getElementById('root')
);
