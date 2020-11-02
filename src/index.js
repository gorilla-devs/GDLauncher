import React from 'react';
import ReactDOM from 'react-dom';
// import { Provider } from 'react-redux';
// import { ThemeProvider as StyledThemeProvider } from 'styled-components';
// import { PersistGate } from 'redux-persist/integration/react';
// import { ConnectedRouter } from 'connected-react-router';
// import theme from '@ui/theme';
// import { configureStore, history } from './common/store/configureStore';
// // eslint-disable-next-line
import Root from './Root-Test';
// import ModalsManager from './common/components/ModalsManager';

// import 'typeface-roboto';
// import 'inter-ui';
// import ErrorBoundary from './app/desktop/ErrorBoundary';

// const ThemeProvider = ({ theme: themeUI, children }) => {
//   return <StyledThemeProvider theme={themeUI}>{children}</StyledThemeProvider>;
// };

// const { store, persistor } = configureStore();

// window.__store = store;

ReactDOM.render(
  // <Provider store={store}>
  //   <PersistGate loading={null} persistor={persistor}>
  //     <ThemeProvider theme={theme}>
  //       <ConnectedRouter history={history}>
  //         <ErrorBoundary>
  //           <ModalsManager />
  //           <Root history={history} store={store} persistor={persistor} />
  //         </ErrorBoundary>
  //       </ConnectedRouter>
  //     </ThemeProvider>
  //   </PersistGate>
  // </Provider>,
  <Root />,
  document.getElementById('root')
);
