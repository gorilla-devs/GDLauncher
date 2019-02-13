import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import log from 'electron-log';
import makeDir from 'make-dir';
import { PACKS_PATH } from '../../../constants';
import ModsList from './ModsBrowser/ModsList';
import LocalMods from './LocalMods/LocalMods';
import ModPage from './ModsBrowser/ModPage';

import styles from './ModsManager.scss';

let watcher;

type Props = {};

class ModsManager extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      isForge: false,
      checkingForge: true,
      localMods: []
    };
    this.instanceFolder = path.join(PACKS_PATH, props.match.params.instance);
  }

  componentDidMount = async () => {
    // Reads the config file of the instance
    try {
      const config = JSON.parse(
        await promisify(fs.readFile)(
          path.join(this.instanceFolder, 'config.json')
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

    // Starts the watcher and reads the local mods
    try {
      await promisify(fs.access)(path.join(this.instanceFolder, 'mods'));
    } catch (err) {
      await makeDir(path.join(this.instanceFolder, 'mods'));
    }

    this.getMods();
  };

  componentWillUnmount() {
    // Stop watching for changes when this component is unmounted
    try {
      watcher.close();
    } catch (err) {
      log.error(err);
    }
  }

  getMods = async () => {
    let modsList = this.filterMapMods(
      await promisify(fs.readdir)(path.join(this.instanceFolder, 'mods'))
    );

    this.setState({
      localMods: modsList
    });

    // Watches for any changes in the packs dir
    watcher = fs.watch(path.join(this.instanceFolder, 'mods'), async () => {
      modsList = this.filterMapMods(
        await promisify(fs.readdir)(path.join(this.instanceFolder, 'mods'))
      );
      this.setState({
        localMods: modsList
      });
    });
  };

  filterMapMods = mods => {
    return mods
      .filter(el => el !== 'GDLCompanion.jar' && el !== 'LJF.jar')
      .filter(el => path.extname(el) === '.zip' || path.extname(el) === '.jar')
      .map(el => {
        return {
          name: el,
          state: path.extname(el) !== '.disabled',
          key: el,
          height: 50
        };
      });
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
      <div
        style={{
          width: '100%',
          maxWidth: '800px',
          height: '100%',
          overflow: 'hidden'
        }}
      >
        <Switch>
          <Route
            path="/editInstance/:instance/mods/local/:version"
            render={props => <LocalMods localMods={this.state.localMods} {...props} />}
          />
          <Route
            path="/editInstance/:instance/mods/browse/:version/:mod"
            render={props => <ModPage {...props} />}
          />
          <Route
            path="/editInstance/:instance/mods/browse/:version"
            render={props => <ModsList {...props} />}
          />
        </Switch>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

export default connect(mapStateToProps)(ModsManager);
