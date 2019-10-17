import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { StylesProvider } from "@material-ui/styles";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { PersistGate } from "redux-persist/integration/react";
import { ConnectedRouter } from "connected-react-router";
import { configureStore, history } from "./common/store/configureStore";
import { theme } from "./ui";
import RootDev from "./Root-Dev";
import RootWeb from "./Root-Web";
import RootElectron from "./Root-Electron";
import ModalsManager from "./common/components/ModalsManager";

const Root =
  // eslint-disable-next-line no-nested-ternary
  process.env.NODE_ENV === "development"
    ? RootDev
    : process.env.APP_TYPE === "web"
    ? RootWeb
    : RootElectron;

const ThemeProvider = ({ theme, children }) => {
  return (
    <StylesProvider injectFirst>
      <StyledThemeProvider theme={theme}>
        <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
      </StyledThemeProvider>
    </StylesProvider>
  );
};

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
