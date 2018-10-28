// @flow
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import profile from './profile';
import auth from './auth';
import packCreator from './packCreator';
import downloadManager from './downloadManager';
import instancesManager from './instancesManager';
import news from './news';
import autoUpdater from './autoUpdater';
import settings from './settings';

export default function createRootReducer(history: {}) {
  const routerReducer = connectRouter(history)(() => {});

  return connectRouter(history)(
    combineReducers({
      profile,
      router: routerReducer,
      auth,
      packCreator,
      downloadManager,
      instancesManager,
      news,
      autoUpdater,
      settings
    })
  );
}
