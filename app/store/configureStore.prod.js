// @flow
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createHashHistory } from 'history';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { routerMiddleware } from 'connected-react-router';
import createRootReducer from '../reducers';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['settings']
}

const history = createHashHistory();
const rootReducer = createRootReducer(history);

const persistedReducer = persistReducer(persistConfig, rootReducer)

const router = routerMiddleware(history);
const enhancer = applyMiddleware(thunk, router);

function configureStore(initialState) {
  const store = createStore(persistedReducer, initialState, enhancer);
  return store;
}

export default { configureStore, history };
