import React from 'react';
import { render } from 'react-dom';
import log from 'electron-log';
import { AppContainer, setConfig } from 'react-hot-loader';
import Root from './containers/Root';
import { configureStore, history } from './store/configureStore';
import './app.global.scss';

if (module.hot)
  setConfig({
    ignoreSFC: true, // RHL will be __completely__ disabled for SFC
    pureRender: true, // RHL will not change render method
  })
const store = configureStore();
log.info('Welcome to GDLauncher');
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
