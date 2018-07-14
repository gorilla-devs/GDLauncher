// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import counter from './counter';
import profile from './profile';
import auth from './auth';
import packCreator from './packCreator';
import downloadManager from './downloadManager';

const rootReducer = combineReducers({
  counter,
  profile,
  router,
  auth,
  packCreator,
  downloadManager
});

export default rootReducer;
