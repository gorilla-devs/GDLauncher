import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Icon, Tooltip, Select, message, Switch } from 'antd';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import _ from 'lodash';
import makeDir from 'make-dir';
import { bindActionCreators } from 'redux';
import * as packCreatorActions from '../../../actions/packCreator';
import * as downloadManagerActions from '../../../actions/downloadManager';
import { downloadFile } from '../../../utils/downloader';
import { PACKS_PATH, GDL_COMPANION_MOD_URL } from '../../../constants';
import colors from '../../../style/theme/colors.scss';
import styles from './ForgeManager.scss';

type Props = {};

class Instances extends Component<Props> {
  props: Props;

  state = {
    forgeSelectVersion: null,
    loadingCompanionDownload: false,
    companionModState: false
  };

  componentDidMount = async () => {
    try {
      await promisify(fs.access)(
        path.join(PACKS_PATH, this.props.name, 'mods', 'GDLCompanion.jar')
      );
      this.setState({ companionModState: true });
    } catch (err) {}
  };

  removeForge = async () => {
    const config = JSON.parse(
      await promisify(fs.readFile)(
        path.join(PACKS_PATH, this.props.name, 'config.json')
      )
    );
    await promisify(fs.writeFile)(
      path.join(PACKS_PATH, this.props.name, 'config.json'),
      JSON.stringify({ ...config, forgeVersion: null })
    );
  };

  installForge = () => {
    if (this.state.forgeSelectVersion === null) {
      message.warning('You need to select a version.');
    } else {
      this.props.instanceDownloadOverride(
        this.props.data.version,
        this.props.name,
        this.state.forgeSelectVersion
      );
    }
  };

  handleForgeVersionChange = value => {
    this.setState({ forgeSelectVersion: value });
  };

  companionModSwitchChange = async value => {
    this.setState({ loadingCompanionDownload: true });
    if (value) {
      await makeDir(path.join(PACKS_PATH, this.props.name, 'mods'));
      await downloadFile(
        path.join(PACKS_PATH, this.props.name, 'mods', 'GDLCompanion.jar'),
        GDL_COMPANION_MOD_URL,
        () => {}
      );
      this.setState({ companionModState: true });
    } else {
      await promisify(fs.unlink)(
        path.join(PACKS_PATH, this.props.name, 'mods', 'GDLCompanion.jar')
      );
      this.setState({ companionModState: false });
    }
    this.setState({ loadingCompanionDownload: false });
  };

  render() {
    if (this.props.data.forgeVersion === null) {
      return (
        <div style={{ textAlign: 'center', color: colors.red }}>
          Forge is not installed <br />
          <Select
            style={{ width: '140px' }}
            placeholder="Select a version"
            onChange={this.handleForgeVersionChange}
          >
            {_.reverse(this.props.forgeVersions[this.props.data.version]).map(
              ver => (
                <Select.Option value={ver}>{ver}</Select.Option>
              )
            )}
          </Select>
          <br />
          <Button
            type="primary"
            onClick={this.installForge}
            style={{ marginTop: 10 }}
          >
            Install Forge
          </Button>
        </div>
      );
    }
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-evenly',
          textAlign: 'center'
        }}
      >
        <div style={{ color: colors.green }}>
          {this.props.data.forgeVersion} <br />
          <Button
            type="primary"
            onClick={this.removeForge}
            style={{ marginTop: 10 }}
          >
            Remove Forge
          </Button>
        </div>
        <div>
          Companion Mod{' '}
          <Tooltip
            title="The Companion Mod is an optional feature that allows us to keep track of actions happening in the game.
            This way we can create more precise stats on the instance."
          >
            <Icon
              type="info-circle"
              theme="filled"
              className={styles.companionModInfo}
            />
          </Tooltip>
          <br />
          <Switch
            onChange={this.companionModSwitchChange}
            defaultdefaultChecked={this.state.companionModState}
            loading={this.state.loadingCompanionDownload}
            style={{ marginTop: 10 }}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    forgeVersions: state.packCreator.forgeManifest
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    { ...packCreatorActions, ...downloadManagerActions },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Instances);
