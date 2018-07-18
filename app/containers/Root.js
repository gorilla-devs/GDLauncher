// @flow
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import { DragDropContext } from 'react-beautiful-dnd';
import RouteDef from '../routes';


type Props = {
  store: {},
  history: {}
};

export default class Root extends Component<Props> {
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
