import { connectRouter } from 'connected-react-router';
import { combineReducers } from 'redux';
import reducers from './reducers';
import app from './app';
import loading from './loading/reducers';
import modals from './modals/reducers';
import settings from './settings/reducers';

const createRootReducer = history =>
  combineReducers({
    ...reducers,
    loading,
    modals,
    app, // persisted
    settings, // persisted
    router: connectRouter(history)
  });

export default createRootReducer;
