import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroller';
import path from 'path';
import { List, Icon, Avatar, Radio, Button, Skeleton, Transfer } from 'antd';
import Promise from 'bluebird';
import { promisify } from 'util';
import fs from 'fs';
import { PACKS_PATH } from '../../../../constants';
import { downloadFile } from '../../../../utils/downloader';

import styles from './ModsBrowser.scss';

type Props = {};


class ModsBrowser extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      initLoading: true,
      loading: false,
      list: [],
      installing: []
    }
  }

  componentDidMount = async () => {
    const res = await axios.get(`https://staging_cursemeta.dries007.net/api/v3/direct/addon/search?gameId=432&pageSize=10&index=${this.state.list.length}&sort=Featured&categoryId=0&sectionId=6`);
    const mods = await promisify(fs.readdir)(path.join(PACKS_PATH, this.props.instance, 'mods'));
    this.setState({
      initLoading: false,
      list: res.data,
    });
  }

  onLoadMore = async () => {
    this.setState({
      loading: true,
      // Adding 10 fakes elements to the list to simulate a loading
      list: this.state.list.concat([...new Array(10)].map(() => ({ loading: true, name: {} }))),
    });
    const res = await axios.get(`https://staging_cursemeta.dries007.net/api/v3/direct/addon/search?gameId=432&pageSize=10&index=${this.state.list.length}&sort=Featured&categoryId=0&sectionId=6`);
    // We now remove the previous 10 elements and add the real 10
    const data = this.state.list.slice(0, this.state.list.length - 10).concat(res.data);
    this.setState({
      list: data,
      loading: false,
    }, () => {
      // Resetting window's offsetTop so as to display react-virtualized demo underfloor.
      // In a real scene, you can use the public method of react-virtualized:
      // https://stackoverflow.com/questions/46700726/how-to-use-public-method-updateposition-of-react-virtualized
      window.dispatchEvent(new Event('resize'));
    });
  }

  installMod = async (data, parent = null) => {
    const { projectFileId, projectFileName } = data.gameVersionLatestFiles.find(n => n.gameVersion === this.props.version);
    if (parent === null) {
      this.setState(prevState => ({
        installing: {
          ...prevState.installing,
          [projectFileName]: {
            installing: true,
            completed: false
          }
        }
      }));
    }

    const url = await axios.get(`https://staging_cursemeta.dries007.net/api/v3/direct/addon/${data.id}/file/${projectFileId}`);

    await downloadFile(path.join(PACKS_PATH, this.props.instance, 'mods', url.data.fileNameOnDisk), url.data.downloadUrl, () => { });
    if (url.data.dependencies.length !== 0) {
      url.data.dependencies.forEach(async dep => {
        // It looks like type 1 are required dependancies and type 3 are dependancies that are already embedded in the parent one
        if (dep.type === 1) {
          const depData = await axios.get(`https://staging_cursemeta.dries007.net/api/v3/direct/addon/${dep.addonId}`);
          await this.installMod(depData.data, projectFileName);
        }
      });
    }
    this.setState(prevState => ({
      installing: {
        ...prevState.installing,
        [parent === null ? projectFileName : parent]: {
          installing: false,
          completed: true
        }
      }
    }));
  };

  isDownloadCompleted = (data) => {
    const mod = Object.keys(this.state.installing).find(n => n === data.gameVersionLatestFiles.find(x => x.gameVersion === this.props.version).projectFileName);
    return this.state.installing[mod] && this.state.installing[mod].completed;
  };

  isInstalling = (data) => {
    const mod = Object.keys(this.state.installing).find(n => n === data.gameVersionLatestFiles.find(x => x.gameVersion === this.props.version).projectFileName);
    return this.state.installing[mod] && this.state.installing[mod].installing;
  };

  render() {
    const { initLoading, loading, list } = this.state;
    const loadMore = !initLoading && !loading ? (
      <div style={{ textAlign: 'center', marginTop: 12, height: 32, lineHeight: '32px' }}>
        <Button onClick={this.onLoadMore}>Load More</Button>
      </div>
    ) : null;
    return (
      <div>
        <List
          className="demo-loadmore-list"
          loading={initLoading}
          itemLayout="horizontal"
          loadMore={loadMore}
          dataSource={list}
          renderItem={item => (
            <List.Item actions={[
              !item.loading && <Button
                type="primary"
                loading={this.isInstalling(item)}
                disabled={this.isDownloadCompleted(item)}
                onClick={() => this.installMod(item)}
              >
                {this.isInstalling(item) ? "Installing" : (this.isDownloadCompleted(item) ? "Installed" : "Install")}
              </Button>
            ]}>
              <Skeleton avatar title={false} loading={item.loading} active>
                <List.Item.Meta
                  avatar={<Avatar src={item.loading ? "" : (item.attachments ? item.attachments[0].thumbnailUrl : "https://www.curseforge.com/Content/2-0-6836-19060/Skins/CurseForge/images/anvilBlack.png")} />}
                  title={item.name}
                  description={item.summary}
                />
              </Skeleton>
            </List.Item>
          )}
        />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {};
}


export default connect(mapStateToProps)(ModsBrowser);
