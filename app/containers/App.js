// @flow
import * as React from 'react';

type Props = {
  children: Object
};

export default class App extends React.Component<Props> {
  props: Props;

  render() {
    const { children } = this.props;
    return <React.Fragment>{children}</React.Fragment>;
  }
}
