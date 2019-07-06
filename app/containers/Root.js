import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect, Provider } from 'react-redux';
import log from 'electron-log';
import { ConnectedRouter } from 'connected-react-router';
import * as SettingsActions from '../actions/settings';
import CrashHandler from '../components/CrashHandler/CrashHandler';
import RouteDef from '../routes';

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
    const { store, history } = this.props;
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <CrashHandler />;
    }

    return (
      <Provider store={store}>
        <div>
          <ConnectedRouter history={history}>
            <RouteDef history={history} />
          </ConnectedRouter>
        </div>
      </Provider>
    );
  }
}

export default Root;
