import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { ThemeProvider } from "styled-components";
import { PersistGate } from "redux-persist/integration/react";
import { ConnectedRouter } from "connected-react-router";
import { configureStore, history } from "./common/store/configureStore";
import { theme } from "./ui";
import RootDev from "./Root-Dev";
import RootWeb from "./Root-Web";
import RootElectron from "./Root-Electron";
import ModalsManager from "./common/components/ModalsManager";

const Root =
  process.env.NODE_ENV === "development"
    ? RootDev
    : process.env.APP_TYPE === "web"
    ? RootWeb
    : RootElectron;

const { store, persistor } = configureStore();

if (process.env.NODE_ENV === "development") window.__store = store;

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ThemeProvider theme={theme}>
        <div
          css={`
            width: 100%;
            height: 100%;
          `}
        >
          <ConnectedRouter history={history}>
            <ModalsManager />
            <Root history={history} store={store} persistor={persistor} />
          </ConnectedRouter>
        </div>
      </ThemeProvider>
    </PersistGate>
  </Provider>,
  document.getElementById("root")
);
