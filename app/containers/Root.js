import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect, Provider } from 'react-redux';
import log from 'electron-log';
import { ConnectedRouter } from 'connected-react-router';
import * as SettingsActions from '../actions/settings';
import RouteDef from '../routes';


type Props = {
  store: object,
  history: object
};

class Root extends Component<Props> {


  componentDidCatch(error, info) {
    if (error) {
      log.error(error);
    } else if(info) {
      log.info(info);
    }
  }

  render() {
    const { store, history } = this.props;
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