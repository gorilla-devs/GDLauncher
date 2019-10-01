import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import log from 'electron-log';
import { PersistGate } from 'redux-persist/integration/react';
import { ConnectedRouter } from 'connected-react-router';
import { theme } from 'ui';
import CrashHandler from '../components/CrashHandler/CrashHandler';
import App from './App';

type Props = {
  store: object,
  history: object
};

if (process.env.NODE_ENV !== 'production') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React);
}

/*
USE IN CLASS COMPONENTS -> static whyDidYouRender = true
USE IN PURE COMPONENTS  -> BigListPureComponent.whyDidYouRender = true

*/

class Root extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    log.error(error, info);
    this.setState({ hasError: true });
  }

  render() {
    const { store, persistor, history } = this.props;
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <CrashHandler />;
    }

    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider theme={theme}>
            <div>
              <ConnectedRouter history={history}>
                <App history={history} />
              </ConnectedRouter>
            </div>
          </ThemeProvider>
        </PersistGate>
      </Provider>
    );
  }
}

export default Root;
