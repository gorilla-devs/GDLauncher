// @flow
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import log from 'electron-log';
import { ConnectedRouter } from 'react-router-redux';
import RouteDef from '../routes';


type Props = {
  store: {},
  history: {}
};

export default class Root extends Component<Props> {

  componentDidCatch(error, info) {
    if (error) {
      log.error(error);
    } else if(info) {
      log.info(info);
    }
  }

  render() {
    return (
      <Provider store={this.props.store}>
        <div>
          <ConnectedRouter history={this.props.history}>
            <RouteDef history={this.props.history} />
          </ConnectedRouter>
        </div>
      </Provider>
    );
  }
}
