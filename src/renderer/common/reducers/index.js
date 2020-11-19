import { connectRouter } from 'connected-react-router';
import { combineReducers } from 'redux';
import modals from './modals/reducers';
import loading from './loading/reducers';
import reducers from './reducers';

const createRootReducer = history =>
  combineReducers({
    ...reducers,
    loading,
    modals,
    router: connectRouter(history)
  });

export default createRootReducer;
