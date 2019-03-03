// @flow
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import profile from './profile';
import auth from './auth';
import packCreator from './packCreator';
import downloadManager from './downloadManager';
import instancesManager from './instancesManager';
import news from './news';
import settings from './settings';
import javaArguments from './javaArguments';

export default history =>
  combineReducers({
    profile,
    router: connectRouter(history),
    auth,
    packCreator,
    downloadManager,
    instancesManager,
    news,
    settings,
    javaArguments
  });
