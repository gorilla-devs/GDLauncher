import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import log from 'electron-log';
import { List, Icon, Avatar, Radio } from 'antd';
import { PACKS_PATH } from '../../../constants';
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
      isForge: false,
      version: null,
      checkingForge: true
    };
  }

  componentDidMount = async () => {
    try {
      const config = JSON.parse(
        await promisify(fs.readFile)(
          path.join(PACKS_PATH, this.props.instance, 'config.json')
        )
      );

      this.setState({ version: config.version });

      if (config.forgeVersion !== null) {
        this.setState({ isForge: true });
      }
    } catch (err) {
      log.error(err.message);
    } finally {
      this.setState({ checkingForge: false });
    }
  };

  handleModeChange = e => {
    const page = e.target.value;
    this.setState({ page });
  };

  render() {
    if (this.state.checkingForge) {
      return null;
    }
    if (!this.state.isForge) {
      return (
        <div>
          <h2 style={{ textAlign: 'center', margin: 20 }}>
            This instance does not allow mods. <br /> Install forge if you want
            to use them
          </h2>
        </div>
      );
    }
    return (
      <div style={{ width: '100%', maxWidth: '800px', margin: 10 }}>
        <Radio.Group
          onChange={this.handleModeChange}
          value={this.state.page}
          buttonStyle="solid"
          style={{ display: 'block', margin: '0 auto', textAlign: 'center' }}
        >
          <Radio.Button value="local">Local</Radio.Button>
          <Radio.Button value="browse">Browse</Radio.Button>
        </Radio.Group>
        {this.state.page === 'local' ? (
          <LocalMods instance={this.props.instance} />
        ) : (
          <ModsBrowser
            version={this.state.version}
            instance={this.props.instance}
          />
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

export default connect(mapStateToProps)(ModsManager);
