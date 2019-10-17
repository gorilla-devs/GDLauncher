import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { createHashHistory } from "history";
import { persistReducer, persistStore } from "redux-persist";
import { routerMiddleware } from "connected-react-router";
import isElectron from "is-electron";
import createRootReducer from "../reducers";
import middlewareInstances from "../../app/desktop/utils/middlewareInstances";
import persistConfig from "./persistConfig";

const history = createHashHistory();
const rootReducer = createRootReducer(history);

const persistedReducer = persistReducer(persistConfig, rootReducer);

const router = routerMiddleware(history);
const enhancer = applyMiddleware(
  thunk,
  router,
  isElectron() ? middlewareInstances : undefined
);

function configureStore(initialState) {
  const store = createStore(persistedReducer, initialState, enhancer);
  const persistor = persistStore(store);
  return { store, persistor };
}

export default { configureStore, history };
