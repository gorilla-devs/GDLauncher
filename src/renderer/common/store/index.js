import { createStore, applyMiddleware, compose } from 'redux';
import { createHashHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';
import { createLogger } from 'redux-logger';
import thunk from './thunkEnhancer';
import createRootReducer from '../reducers';

const history = createHashHistory();
const rootReducer = createRootReducer(history);

const router = routerMiddleware(history);

const logger = createLogger({
  // We need to hide the UPDATE_PROGRESS dispatches, since they are just too many and they slow down the execution
  predicate: (getState, action) => action.type,
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

const enhancer = compose(
  applyMiddleware(
    thunk,
    router,
    process.env.NODE_ENV !== 'production' ? logger : undefined
  )
);

const configureStore = () => {
  const store = createStore(rootReducer, enhancer);
  if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept(
      '../reducers',
      () => store.replaceReducer(require('../reducers')).default // eslint-disable-line global-require
    );
  }

  return store;
};

export default { configureStore, history };
