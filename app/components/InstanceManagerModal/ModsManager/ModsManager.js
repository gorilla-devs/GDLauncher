import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { List, Icon, Avatar, Radio } from 'antd';
import ModsBrowser from './ModsBrowser/ModsBrowser';
import LocalMods from './LocalMods/LocalMods';

import styles from './ModsManager.scss';

type Props = {};

class ModsManager extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      page: 'local',
    };
  }

  handleModeChange = (e) => {
    const page = e.target.value;
    this.setState({ page });
  }

  render() {
    return (
      <div>
        <Radio.Group onChange={this.handleModeChange} value={this.state.page} style={{ display: 'block', margin: '0 auto', textAlign: 'center' }}>
          <Radio.Button value="local">Local</Radio.Button>
          <Radio.Button value="browse">Browse</Radio.Button>
        </Radio.Group>
        {this.state.page === 'local' ? <LocalMods instance={this.props.instance} /> : <ModsBrowser instance={this.props.instance} />}
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {};
}


export default connect(mapStateToProps)(ModsManager);
