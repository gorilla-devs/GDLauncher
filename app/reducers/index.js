// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import counter from './counter';
import profile from './profile';
import auth from './auth';
import packCreator from './packCreator';
import downloadManager from './downloadManager';
import instancesManager from './instancesManager';
import news from './news';
import autoUpdater from './autoUpdater';

const rootReducer = combineReducers({
  counter,
  profile,
  router,
  auth,
  packCreator,
  downloadManager,
  instancesManager,
  news,
  autoUpdater
});

export default rootReducer;
