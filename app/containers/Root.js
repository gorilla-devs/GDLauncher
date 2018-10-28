import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect, Provider } from 'react-redux';
import log from 'electron-log';
import { ConnectedRouter } from 'connected-react-router';
import * as SettingsActions from '../actions/settings';
import RouteDef from '../routes';


type Props = {
  store: {},
  history: {},
  loadSettings: () => void
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

function mapDispatchToProps(dispatch) {
  return bindActionCreators(SettingsActions, dispatch);
}

export default connect(null, mapDispatchToProps)(Root);