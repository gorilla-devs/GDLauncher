// @flow
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createHashHistory } from 'history';
import { createLogger } from 'redux-logger';
import { routerMiddleware } from 'connected-react-router';
import createRootReducer from '../reducers';

const history = createHashHistory();
const rootReducer = createRootReducer(history);

const logger = createLogger({
  // We need to hide the UPDATE_PROGRESS dispatches, since they are just too many and they slow down the execution
  collapsed: true,
  duration: true,
  colors: {
    title: () => '#8e44ad',
    prevState: () => '#9E9E9E',
    action: () => '#03A9F4',
    nextState: () => '#4CAF50',
    error: () => '#F20404'
  }
});

const router = routerMiddleware(history);
const enhancer = applyMiddleware(thunk, router, logger);

function configureStore(initialState?: counterStateType) {
  return createStore(rootReducer, initialState, enhancer);
}

export default { configureStore, history };
