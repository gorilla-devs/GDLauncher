import React, { Component } from 'react';
import { connect } from 'react-redux';
import Link from 'react-router-dom/Link';
import axios from 'axios';
import ContentLoader from 'react-content-loader';
import path from 'path';
import log from 'electron-log';
import _ from 'lodash';
import { List, Avatar, Button, Input, Select, Icon, Popover } from 'antd';
import { PACKS_PATH, CURSEMETA_API_URL } from '../../../../constants';
import { downloadFile } from '../../../../utils/downloader';
import { numberToRoundedWord } from '../../../../utils/numbers';

import styles from './ModsList.scss';

type Props = {};

class ModsList extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      initLoading: true,
      loading: false,
      list: [],
      data: [],
      installing: [],
      searchText: '',
      filterType: 'Featured'
    };
    console.log(this);
  }

  componentDidMount = async () => {
    try {
      await this.getMods();
    } catch (err) {
      log.error(err.message);
    }
  };

  getMods = async () => {
    this.setState({
      initLoading: true,
      list: [...new Array(10)].map(() => ({ loading: true, name: {} })),
      data: []
    });
    const res = await axios.get(
      `${CURSEMETA_API_URL}/direct/addon/search?gameId=432&pageSize=10&index=0&sort=${
        this.state.filterType
      }&searchFilter=${this.state.searchText}&gameVersion=${
        this.props.match.params.version
      }&categoryId=0&sectionId=6&sortDescending=${this.state.filterType !==
        'author' && this.state.filterType !== 'name'}`
    );
    this.setState({
      initLoading: false,
      list: res.data,
      data: res.data
    });
  };

  onLoadMore = async () => {
    this.setState({
      loading: true,
      // Adding 10 fakes elements to the list to simulate a loading
      list: this.state.data.concat(
        [...new Array(10)].map(() => ({ loading: true, name: null }))
      )
    });
    const res = await axios.get(
      `${CURSEMETA_API_URL}/direct/addon/search?gameId=432&pageSize=10&index=${
        this.state.list.length
      }&sort=${this.state.filterType}&searchFilter=${
        this.state.searchText
      }&gameVersion=${
        this.props.match.params.version
      }&categoryId=0&sectionId=6&sortDescending=${this.state.filterType !==
        'author' && this.state.filterType !== 'name'}`
    );
    // We now remove the previous 10 elements and add the real 10
    const data = this.state.data.concat(res.data);
    this.setState(
      {
        list: data,
        data,
        loading: false
      },
      () => {
        // Resetting window's offsetTop so as to display react-virtualized demo underfloor.
        // In a real scene, you can use the public method of react-virtualized:
        // https://stackoverflow.com/questions/46700726/how-to-use-public-method-updateposition-of-react-virtualized
        window.dispatchEvent(new Event('resize'));
      }
    );
  };

  installMod = async (data, parent = null) => {
    const { projectFileId, projectFileName } = data.gameVersionLatestFiles
      ? data.gameVersionLatestFiles.find(
          n => n.gameVersion === this.props.match.params.version
        )
      : data;
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

    const url = await axios.get(
      `${CURSEMETA_API_URL}/direct/addon/${data.id}/file/${projectFileId}`
    );

    await downloadFile(
      path.join(
        PACKS_PATH,
        this.props.match.params.instance,
        'mods',
        url.data.fileNameOnDisk
      ),
      url.data.downloadUrl,
      () => {}
    );
    if (url.data.dependencies.length !== 0) {
      url.data.dependencies.forEach(async dep => {
        // It looks like type 1 are required dependancies and type 3 are dependancies that are already embedded in the parent one
        if (dep.type === 1 && dep.addonId !== data.id) {
          const depData = await axios.get(
            `${CURSEMETA_API_URL}/direct/addon/${dep.addonId}`
          );
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

  getAddonFiles = async addon => {
    const url = await axios.get(
      `${CURSEMETA_API_URL}/direct/addon/${addon}/files`
    );
    const files = url.data.filter(el =>
      el.gameVersion.includes(this.props.match.params.version)
    );
    this.setState(prevState => ({
      list: prevState.list.map(
        el =>
          el.id === addon
            ? { ...el, allFiles: _.orderBy(files, ['fileDate'], ['desc']) }
            : el
      )
    }));
    console.log(this.state.list);
  };

  isDownloadCompleted = data => {
    if (typeof data === 'object') {
      const mod = Object.keys(this.state.installing).find(
        n =>
          n ===
          data.gameVersionLatestFiles.find(
            x => x.gameVersion === this.props.match.params.version
          ).projectFileName
      );
      return (
        this.state.installing[mod] && this.state.installing[mod].completed
      );
    }
    return this.state.installing[data] && this.state.installing[data].completed;
  };

  isInstalling = data => {
    if (typeof data === 'object') {
      const mod = Object.keys(this.state.installing).find(
        n =>
          n ===
          data.gameVersionLatestFiles.find(
            x => x.gameVersion === this.props.match.params.version
          ).projectFileName
      );
      return (
        this.state.installing[mod] && this.state.installing[mod].installing
      );
    }
    return this.state.installing[data] && this.state.installing[data].installing;
  };

  filterChanged = async value => {
    this.setState({ filterType: value }, async () => {
      try {
        await this.getMods();
      } catch (err) {
        log.error(err.message);
      }
    });
  };

  onSearchChange = e => {
    this.setState({ searchText: encodeURI(e.target.value) });
  };

  onSearchSubmit = async () => {
    this.getMods();
  };

  emitEmptySearchText = () => {
    this.setState({ searchText: '' }, () => {
      this.getMods();
    });
  };

  render() {
    const { initLoading, loading, list } = this.state;
    const loadMore =
      !initLoading && !loading ? (
        <div
          style={{
            textAlign: 'center',
            marginTop: 12,
            height: 32,
            lineHeight: '32px'
          }}
        >
          <Button onClick={this.onLoadMore}>Load More</Button>
        </div>
      ) : null;
    return (
      <div style={{ height: '83%' }}>
        <div className={styles.header}>
          <Input
            placeholder="Search Here"
            onChange={this.onSearchChange}
            onPressEnter={this.onSearchSubmit}
            style={{ width: 200 }}
            value={this.state.searchText}
            suffix={
              this.state.searchText !== '' ? (
                <span onClick={this.emitEmptySearchText}>
                  <Icon
                    type="close-circle"
                    theme="filled"
                    style={{ cursor: 'pointer', color: '#999' }}
                  />
                </span>
              ) : null
            }
          />
          <div>
            Sort By{' '}
            <Select
              defaultValue="featured"
              onChange={this.filterChanged}
              style={{ width: 150 }}
            >
              <Select.Option value="featured">Featured</Select.Option>
              <Select.Option value="popularity">Popularity</Select.Option>
              <Select.Option value="lastupdated">Last Updated</Select.Option>
              <Select.Option value="name">Name</Select.Option>
              <Select.Option value="author">Author</Select.Option>
              <Select.Option value="totaldownloads">
                Total Downloads
              </Select.Option>
            </Select>
          </div>
        </div>
        <List
          className={styles.modsContainer}
          itemLayout="horizontal"
          loadMore={loadMore}
          dataSource={list}
          ref={this.scroller}
          renderItem={item => (
            <List.Item
              actions={[
                !item.loading && (
                  <Button.Group>
                    <Button
                      type="primary"
                      loading={this.isInstalling(item)}
                      disabled={this.isDownloadCompleted(item)}
                      onClick={() => this.installMod(item)}
                    >
                      {this.isInstalling(item)
                        ? 'Installing'
                        : this.isDownloadCompleted(item)
                          ? 'Installed'
                          : 'Install'}
                    </Button>
                    <Popover
                      content={
                        <div style={{ width: 500, height: 200 }}>
                          {item.allFiles ? (
                            <div style={{ overflowY: 'auto', height: 200 }}>
                              {item.allFiles.map((el, index) => (
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    margin: '0 10px',
                                    height: '50px',
                                    background: `var(--secondary-color-${index % 2 === 0 ? 1 : 2})`
                                  }}
                                >
                                  <span style={{lineHeight: '50px'}}>{el.fileNameOnDisk}</span>
                                  <Button
                                    type="primary"
                                    loading={this.isInstalling(el.fileName)}
                                    disabled={this.isDownloadCompleted(el.fileName)}
                                    onClick={() =>
                                      this.installMod({
                                        id: item.id,
                                        projectFileId: el.id,
                                        projectFileName: el.fileName
                                      })
                                    }
                                  >
                                    {this.isInstalling(el.fileName)
                                      ? 'Installing'
                                      : this.isDownloadCompleted(el.fileName)
                                        ? 'Installed'
                                        : 'Install'}
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <ContentLoader
                              height={200}
                              width={500}
                              speed={0.6}
                              primaryColor="var(--secondary-color-2)"
                              secondaryColor="var(--secondary-color-3)"
                              style={{
                                height: '200px',
                                width: '500px'
                              }}
                            >
                              {Array.from({ length: 4 }, (item, index) => (
                                <rect
                                  x="0"
                                  y={index * 55}
                                  rx="0"
                                  ry="0"
                                  width="500"
                                  height="28"
                                />
                              ))}
                            </ContentLoader>
                          )}
                        </div>
                      }
                      onVisibleChange={visible =>
                        visible && this.getAddonFiles(item.id)
                      }
                      placement="bottomRight"
                      title={`${item.name} versions`}
                      trigger="click"
                    >
                      <Button type="primary" icon="caret-down" />
                    </Popover>
                  </Button.Group>
                )
              ]}
            >
              {item.loading ? (
                <ContentLoader
                  height={100}
                  speed={0.6}
                  primaryColor="var(--secondary-color-2)"
                  secondaryColor="var(--secondary-color-3)"
                  style={{
                    height: '100px'
                  }}
                >
                  <circle cx="17" cy="40" r="17" />
                  <rect
                    x="45"
                    y="0"
                    rx="0"
                    ry="0"
                    width={Math.floor(Math.random() * 80) + 150}
                    height="20"
                  />
                  <rect
                    x="45"
                    y="30"
                    rx="0"
                    ry="0"
                    width={Math.floor(Math.random() * 150) + 250}
                    height="16"
                  />
                  <rect
                    x="45"
                    y="50"
                    rx="0"
                    ry="0"
                    width={Math.floor(Math.random() * 150) + 250}
                    height="16"
                  />
                </ContentLoader>
              ) : (
                <List.Item.Meta
                  avatar={
                    <Avatar
                      src={
                        item.loading
                          ? ''
                          : item.attachments
                            ? item.attachments[0].thumbnailUrl
                            : 'https://www.curseforge.com/Content/2-0-6836-19060/Skins/CurseForge/images/anvilBlack.png'
                      }
                    />
                  }
                  title={
                    <Link
                      to={{
                        pathname: `/editInstance/${
                          this.props.match.params.instance
                        }/mods/browse/${this.props.match.params.version}/${
                          item.id
                        }`,
                        state: { modal: true }
                      }}
                      replace
                    >
                      {item.name}
                    </Link>
                  }
                  description={
                    item.loading ? (
                      ''
                    ) : (
                      <div>
                        {item.summary}
                        <div className={styles.modFooter}>
                          <span>
                            Downloads: {numberToRoundedWord(item.downloadCount)}
                          </span>
                          <span>
                            Updated:{' '}
                            {new Date(
                              item.latestFiles[0].fileDate
                            ).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    )
                  }
                />
              )}
            </List.Item>
          )}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

export default connect(mapStateToProps)(ModsList);
