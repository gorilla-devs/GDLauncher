import React, { Component } from 'react';
import { connect } from 'react-redux';
import Link from 'react-router-dom/Link';

import styles from './ModPage.scss';

type Props = {};

class ModPage extends Component<Props> {
  props: Props;

  render() {
    return (
      <div style={{ width: '100%', maxWidth: '800px', margin: 10 }}>
        <Link
          to={{
            pathname: `/editInstance/${
              this.props.match.params.instance
            }/mods/browse/${this.props.match.params.version}`,
            state: { modal: true }
          }}
          replace
        >
          Back
        </Link>
        {this.props.match.params.mod}
        ASDASD
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

export default connect(mapStateToProps)(ModPage);
