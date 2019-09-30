import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect, Provider } from 'react-redux';
import {createGlobalStyle} from 'styled-components';
import log from 'electron-log';
import { ConnectedRouter } from 'connected-react-router';
import * as SettingsActions from '../actions/settings';
import CrashHandler from '../components/CrashHandler/CrashHandler';
import RouteDef from '../routes';

type Props = {
  store: object,
  history: object
};

if (process.env.NODE_ENV !== 'production') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React);
}

/*
USE IN CLASS COMPONENTS -> static whyDidYouRender = true
USE IN PURE COMPONENTS  -> BigListPureComponent.whyDidYouRender = true

*/

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'GlacialIndifferenceBold';
    src: url('./assets/fonts/GlacialIndifferenceBold.otf') format('opentype');
    font-weight: normal;
    font-style: normal;
  }

  @font-face {
    font-family: 'GlacialIndifferenceItalic';
    src: url('./assets/fonts/GlacialIndifferenceItalic.otf') format('opentype');
    font-weight: normal;
    font-style: italic;
  }

  @font-face {
    font-family: 'GlacialIndifferenceMedium';
    src: url('./assets/fonts/GlacialIndifferenceMedium.otf') format('opentype');
    font-weight: normal;
    font-style: normal;
  }

  @font-face {
    font-family: 'GlacialIndifferenceRegular';
    src: url('./assets/fonts/GlacialIndifferenceRegular.otf') format('opentype');
    font-weight: normal;
    font-style: normal;
  }
`;

class Root extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    log.error(error, info);
    this.setState({ hasError: true });
  }

  render() {
    const { store, history } = this.props;
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <CrashHandler />;
    }

    return (
      <Provider store={store}>
        <div>
          <GlobalStyle />
          <ConnectedRouter history={history}>
            <RouteDef history={history} />
          </ConnectedRouter>
        </div>
      </Provider>
    );
  }
}

export default Root;
