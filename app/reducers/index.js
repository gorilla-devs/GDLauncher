// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import counter from './counter';
import profile from './profile';
import auth from './auth';
import vanilla from './vanillaMC';
import downloadManager from './downloadManager';

const rootReducer = combineReducers({
  counter,
  profile,
  router,
  auth,
  profile,
  vanilla,
  downloadManager
});

export default rootReducer;
