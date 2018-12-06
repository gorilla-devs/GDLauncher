import React from 'react';
import { render } from 'react-dom';
import { AppContainer, setConfig } from 'react-hot-loader';
import Root from './containers/Root';
import { configureStore, history } from './store/configureStore';
import './app.global.scss';

if (module.hot) setConfig({ pureSFC: true })
const store = configureStore();
console.log(
  '%cWelcome to GDLauncher',
  'background: #2c3e50; color: white; display: block; font-size:50px;'
);
render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    const NextRoot = require('./containers/Root').default; // eslint-disable-line global-require
    render(
      <AppContainer>
        <NextRoot store={store} history={history} />
      </AppContainer>,
      document.getElementById('root')
    );
  });
}
