// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import counter from './counter';
import profile from './profile';
import auth from './auth';
import packManager from './packManager';
import downloadManager from './downloadManager';

const rootReducer = combineReducers({
  counter,
  profile,
  router,
  auth,
  packManager,
  downloadManager
});

export default rootReducer;
