// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import counter from './counter';
import profile from './profile';
import auth from './auth';
import packCreator from './packCreator';
import downloadManager from './downloadManager';
import instancesManager from './instancesManager';

const rootReducer = combineReducers({
  counter,
  profile,
  router,
  auth,
  packCreator,
  downloadManager,
  instancesManager
});

export default rootReducer;
