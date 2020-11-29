import React, { memo } from 'react';
import styled from 'styled-components';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';
import BrowserStyles from './components/BrowserStyles';
import ModalsManager from '../common/components/ModalsManager';
import Home from './routes/Home';
import Profile from './routes/Profile';
import Browser from './routes/Browser';
import Login from './routes/Login';
import Navbar from './components/Navbar';
import configureStore from '../common/store';

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
window.__store = store;

const BrowserRoot = () => {
  return (
    <Provider store={store}>
      <ConnectedRouter history={configureStore.history}>
        <Container>
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
              <Route path="/profile">
                <Profile />
              </Route>
              <Route path="/login">
                <Login />
              </Route>
            </Switch>
          </Router>
        </Container>
      </ConnectedRouter>
    </Provider>
  );
};

export default memo(BrowserRoot);
