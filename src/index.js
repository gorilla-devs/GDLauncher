import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import { basename } from 'path';
import { RewriteFrames as RewriteFramesIntegration } from '@sentry/integrations';
import { Provider } from 'react-redux';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { ipcRenderer } from 'electron';
import { PersistGate } from 'redux-persist/integration/react';
import { ConnectedRouter } from 'connected-react-router';
import { configureStore, history } from './common/store/configureStore';
import theme from './ui/theme';
import RootDev from './Root-Dev';
import RootWeb from './Root-Web';
import RootElectron from './Root-Electron';
import ModalsManager from './common/components/ModalsManager';
import { version } from '../package.json';

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

setTimeout(() => {
  if (process.env.NODE_ENV !== 'development') {
    ipcRenderer
      .invoke('getGaId')
      .then(v => {
        if (!v) {
          console.warn('No analytics token provided.');
          return;
        }
        window.gaInitialized = true;
        window.ga =
          window.ga ||
          // eslint-disable-next-line func-names
          function () {
            // eslint-disable-next-line prefer-rest-params
            (window.ga.q = window.ga.q || []).push(arguments);
          };
        window.ga.l = +new Date();
        window.ga('create', v, 'none');
        window.ga('set', 'transport', 'xhr');
        window.ga('set', 'appName', 'GDLauncher');
        window.ga('set', 'checkProtocolTask', null);
        window.ga('set', 'checkStorageTask', null);
        window.ga('set', 'storage', 'none');
        window.ga('set', 'storeGac', null);
        window.ga('set', 'anonymizeIp', true);
        window.ga('set', 'ds', 'app');
        return window;
      })
      .catch(console.error);
  }
}, 0);

ipcRenderer
  .invoke('getSentryDsn')
  .then(dsn => {
    if (!dsn) {
      console.warn('No error monitoring token provided.');
      return;
    }
    return Sentry.init({
      dsn,
      integrations: [
        new Integrations.BrowserTracing(),
        new RewriteFramesIntegration({
          root: process.cwd(),
          iteratee: frame => {
            if (!frame.filename) {
              return frame;
            }

            // eslint-disable-next-line no-param-reassign
            frame.filename = frame.filename.replace('file://', '');
            // Check if the frame filename begins with `/` or a Windows-style prefix such as `C:\`
            const isWindowsFrame = /^[A-Z]:\\/.test(frame.filename);
            const startsWithSlash = /^\//.test(frame.filename);
            if (isWindowsFrame || startsWithSlash) {
              const filename = isWindowsFrame
                ? frame.filename
                    .replace(/^[A-Z]:/, '') // remove Windows-style prefix
                    .replace(/\\/g, '/') // replace all `\\` instances with `/`
                : frame.filename;
              const base = basename(filename);
              // eslint-disable-next-line no-param-reassign
              frame.filename = `app:///${base}`;
            }
            return frame;
          }
        })
      ],
      tracesSampleRate: 1.0,
      release: version,
      dist: process.env.REACT_APP_RELEASE_TYPE
    });
  })
  .catch(console.error);

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
