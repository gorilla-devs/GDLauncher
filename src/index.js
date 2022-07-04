import React from 'react';
import ReactDOM from 'react-dom';
// import * as Sentry from '@sentry/react';
// import { Integrations } from '@sentry/tracing';
// import { basename } from 'path';
// import os from 'os';
// import { RewriteFrames as RewriteFramesIntegration } from '@sentry/integrations';
import { Provider } from 'react-redux';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
// import { ipcRenderer } from 'electron';
import { PersistGate } from 'redux-persist/integration/react';
import { ConnectedRouter } from 'connected-react-router';
import { configureStore, history } from './common/store/configureStore';
import theme from './ui/theme';
import RootDev from './Root-Dev';
import RootWeb from './Root-Web';
import RootElectron from './Root-Electron';
import ModalsManager from './common/components/ModalsManager';
// import { version } from '../package.json';

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

// ipcRenderer
//   .invoke('getSentryDsn')
//   .then(dsn => {
//     if (!dsn) {
//       console.warn('No error monitoring token provided.');
//       console.warn(
//         'This is not a GDLauncher official release but it might be a testing release.'
//       );
//       return;
//     }
//     return Sentry.init({
//       dsn,
//       integrations: [
//         new Integrations.BrowserTracing(),
//         new RewriteFramesIntegration({
//           root: process.cwd(),
//           iteratee: frame => {
//             if (!frame.filename) {
//               return frame;
//             }

//             // eslint-disable-next-line no-param-reassign
//             frame.filename = frame.filename.replace('file://', '');
//             // Check if the frame filename begins with `/` or a Windows-style prefix such as `C:\`
//             const isWindowsFrame = /^[A-Z]:\\/.test(frame.filename);
//             const startsWithSlash = /^\//.test(frame.filename);
//             if (isWindowsFrame || startsWithSlash) {
//               const filename = isWindowsFrame
//                 ? frame.filename
//                     .replace(/^[A-Z]:/, '') // remove Windows-style prefix
//                     .replace(/\\/g, '/') // replace all `\\` instances with `/`
//                 : frame.filename;
//               const base = basename(filename);
//               // eslint-disable-next-line no-param-reassign
//               frame.filename = `app:///${base}`;
//             }
//             return frame;
//           }
//         })
//       ],
//       tracesSampleRate: 0.5,
//       release: version,
//       dist: `${process.env.REACT_APP_RELEASE_TYPE}-${os.platform()}`
//     });
//   })
//   .catch(console.error);

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
