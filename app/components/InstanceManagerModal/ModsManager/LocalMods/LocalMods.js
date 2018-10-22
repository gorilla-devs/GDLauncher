import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { remote } from 'electron';
import fss from 'fs';
import path from 'path';
import Promise from 'bluebird';
import makeDir from 'make-dir';
import log from 'electron-log';
import { connect } from 'react-redux';
import { List, Icon, Avatar, Upload, Transfer, Button, Table, Switch } from 'antd';
import { PACKS_PATH } from '../../../../constants';

import styles from './LocalMods.scss';

const fs = Promise.promisifyAll(fss);

type Props = {};

let watcher;

class LocalMods extends Component<Props> {
  props: Props;

  state = {
    mods: [],
    selectedRowKeys: [], // Check here to configure the default column
    loading: false,
  }

  componentDidMount = async () => {
    try {
      await fs.accessAsync(path.join(PACKS_PATH, this.props.match.params.instance, 'mods'));
    } catch (err) {
      await makeDir(path.join(PACKS_PATH, this.props.match.params.instance, 'mods'));
    }
    this.getMods();
  }

  componentWillUnmount() {
    // Stop watching for changes when this component is unmounted
    try {
      watcher.close();
    } catch (err) {
      log.error(err);
    }
  }

  columns = [{
    title: 'Name',
    dataIndex: 'name',
    width: 200,
    render: (title) => path.parse(title.replace('.disabled', '')).name
  }, {
    title: 'State',
    dataIndex: 'state',
    width: 200,
    render: (state, record) => <Switch checked={state} onChange={checked => this.handleChange(checked, record)} />
  }];

  getMods = async () => {
    let mods = (await fs.readdirAsync(path.join(PACKS_PATH, this.props.match.params.instance, 'mods')))
      .filter(el => el !== 'GDLCompanion.jar')
      .map(el => { return { name: el, state: path.extname(el) !== '.disabled', key: el } });
    this.setState({
      mods
    });
    // Watches for any changes in the packs dir. TODO: Optimize
    watcher = fss.watch(path.join(PACKS_PATH, this.props.match.params.instance, 'mods'), async () => {
      mods = (await fs.readdirAsync(path.join(PACKS_PATH, this.props.match.params.instance, 'mods')))
        .filter(el => el !== 'GDLCompanion.jar')
        .map(el => { return { name: el, state: path.extname(el) !== '.disabled', key: el } });
      this.setState({
        mods
      });
    });
  }

  modStateChanger = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  }


  handleChange = async (checked, record) => {
    if (checked) {
      await fs.renameAsync(path.join(PACKS_PATH, this.props.match.params.instance, 'mods', record.name), path.join(PACKS_PATH, this.props.match.params.instance, 'mods', record.name.replace('.disabled', '')));
    } else {
      await fs.renameAsync(path.join(PACKS_PATH, this.props.match.params.instance, 'mods', record.name), path.join(PACKS_PATH, this.props.match.params.instance, 'mods', `${record.name}.disabled`));
    }
  }

  selectFiles = async () => {
    const mods = remote.dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] });
  };

  delete = async () => {
    this.setState({ loading: true });
    await Promise.each(this.state.selectedRowKeys, async el => fs.unlinkAsync(path.join(PACKS_PATH, this.props.match.params.instance, 'mods', el)));
    this.setState({ loading: false, selectedRowKeys: [] });
  };

  render() {
    const { loading, selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.modStateChanger,
    };
    const hasSelected = selectedRowKeys.length > 0;
    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            onClick={this.delete}
            disabled={!hasSelected}
            loading={loading}
          >
            Delete
          </Button>
          <span style={{ marginLeft: 8 }}>
            {hasSelected ? `${selectedRowKeys.length} ${selectedRowKeys.length === 1 ? "mod" : "mods"} selected` : ''}
          </span>
        </div>
        <Table
          rowSelection={rowSelection}
          columns={this.columns}
          dataSource={this.state.mods}
          pagination={false}
          locale={{
            emptyText: 'No mods are installed' 
          }}
        />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {};
}


export default connect(mapStateToProps)(LocalMods);
