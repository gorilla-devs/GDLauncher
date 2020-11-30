import { connectRouter } from 'connected-react-router';
import { combineReducers } from 'redux';
import modals from './modals/reducers';
import loading from './loading/reducers';
import reducers from './reducers';
import persistedReducers from './persistedReducers';
import manifestReducers from './manifestReducers';

const createRootReducer = history =>
  combineReducers({
    ...reducers,
    ...persistedReducers,
    ...manifestReducers,
    loading,
    modals,
    router: connectRouter(history)
  });

export default createRootReducer;
