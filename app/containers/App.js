// @flow
import * as React from 'react';

type Props = {
  children: Object
};

export default class App extends React.Component<Props> {
  props: Props;

  render() {
    const { children } = this.props;
    // Return strict mode only in development
    if (process.env.NODE_ENV === 'development')
      return (
        <React.StrictMode>
          <React.Fragment>{children}</React.Fragment>
        </React.StrictMode>
      );
    // In production return only the children
    return <React.Fragment>{children}</React.Fragment>;
  }
}
