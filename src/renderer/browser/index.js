import React, { memo } from 'react';
import styled from 'styled-components';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';
import PrivateRoute from 'src/renderer/common/components/PrivateRoute';
import ProvideAuth from 'src/renderer/common/components/ProvideAuth';
import BrowserStyles from './components/BrowserStyles';
import ModalsManager from '../common/components/ModalsManager';
import Home from './routes/Home';
import Profile from './routes/Profile';
import Browser from './routes/Browser';
import Login from './routes/Login';
import Navbar from './components/Navbar';
import configureStore from '../common/store';
import NoMatch from './routes/NoMatch';

const Container = styled.div`
  /* display: flex;
  justify-content: center;
  align-items: center; */
  width: 100%;
  height: 100vh;
  text-align: center;
  background: ${props => props.theme.palette.grey[800]};
`;

const store = configureStore.configureStore();
// window.__store = store;

const BrowserRoot = () => {
  return (
    <Provider store={store}>
      <ConnectedRouter history={configureStore.history}>
        <Container>
          <ProvideAuth>
            <Router>
              <BrowserStyles />
              <ModalsManager />
              <Navbar />
              <Switch>
                <Route exact path="/">
                  <Home />
                </Route>
                <Route path="/browser">
                  <Browser />
                </Route>
                <PrivateRoute path="/profile">
                  <Profile />
                </PrivateRoute>
                <Route path="/login">
                  <Login />
                </Route>
                <Route path="*">
                  <NoMatch />
                </Route>
              </Switch>
            </Router>
          </ProvideAuth>
        </Container>
      </ConnectedRouter>
    </Provider>
  );
};

export default memo(BrowserRoot);
