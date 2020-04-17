import { createStore, applyMiddleware, compose } from 'redux';
import { createHashHistory } from 'history';
import { persistReducer, persistStore } from 'redux-persist';
import { routerMiddleware } from 'connected-react-router';
import isElectron from 'is-electron';
import thunk from './thunkEnhancer';
import createRootReducer from '../reducers';
import middlewareInstances from '../../app/desktop/utils/middlewareInstances';
import middlewareApp from '../../app/desktop/utils/middlewareApp';
import persistConfig from './persistConfig';

const history = createHashHistory();
const rootReducer = createRootReducer(history);

const persistedReducer = persistReducer(persistConfig, rootReducer);

const router = routerMiddleware(history);
const enhancer = compose(
  applyMiddleware(
    thunk,
    router,
    isElectron() ? middlewareApp : undefined,
    isElectron() ? middlewareInstances : undefined
  )
);

function configureStore() {
  const store = createStore(persistedReducer, enhancer);
  const persistor = persistStore(store);
  return { store, persistor };
}

export default { configureStore, history };
