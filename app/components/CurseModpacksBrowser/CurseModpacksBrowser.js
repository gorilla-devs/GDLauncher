import React, { useState, useEffect } from 'react';
import Link from 'react-router-dom/Link';
import axios from 'axios';
import ContentLoader from 'react-content-loader';
import _ from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { List, Avatar, Button, Input, Select, Icon } from 'antd';
import { numberToRoundedWord } from '../../utils/numbers';
import * as downloadManagerActions from '../../actions/downloadManager';
import styles from './CurseModpacksBrowser.scss';
import { getSearch } from '../../utils/cursemeta';

function CurseModpacksBrowser(props) {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('Featured');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPacks();
  }, [filterType]);

  const loadPacks = async (reset = true, emptySearch = false) => {
    setLoading(true);
    const loadingArr = [...new Array(15)].map(() => ({
      loading: true,
      name: null
    }));
    if (reset === true) setPacks(loadingArr);
    else setPacks(packs => packs.concat(loadingArr));

    const res = await getSearch(
      'modpacks',
      emptySearch === true ? '' : searchQuery,
      15,
      reset === true ? 0 : packs.length,
      filterType,
      filterType !== 'author' && filterType !== 'name'
    );
    // We now remove the previous 15 elements and add the real 15
    const mappedData = res && res.map(v => ({
      loading: false,
      name: v.name,
      id: v.id,
      attachments: v.attachments,
      summary: v.summary,
      latestFiles: v.latestFiles,
      downloadCount: v.downloadCount,
      authors: v.authors.map(author => author.name)
    }));

    const data = reset === true ? mappedData : packs.concat(mappedData);
    setPacks(data || []);

    setLoading(false);
  };

  const loadMore =
    !loading && packs.length !== 0 && packs.length % 15 === 0 ? (
      <div
        style={{
          textAlign: 'center',
          marginTop: 12,
          height: 32,
          lineHeight: '32px'
        }}
      >
        <Button onClick={() => loadPacks(false)}>Load More</Button>
      </div>
    ) : null;

  const filterChanged = async value => {
    setFilterType(value);
  };

  const onSearchChange = e => {
    setSearchQuery(e.target.value);
    if (e.target.value === '') {
      loadPacks(true, true);
    }
  };

  const onSearchSubmit = async () => {
    loadPacks();
  };

  if (!loading && packs.length === 0 && searchQuery.length === 0) {
    return (
      <h1
        style={{
          textAlign: 'center',
          paddingTop: '20%',
          height: 'calc(100vh - 60px)',
          background: 'var(--secondary-color-1)',
          fontSize: 18
        }}
      >
        Servers are not currently available. Try again later
      </h1>
    );
  }

  return (
    <div
      style={{
        height: 'calc(100vh - 60px)',
        background: 'var(--secondary-color-1)'
      }}
    >
      <div className={styles.header}>
        <Input
          placeholder="Search Here"
          onChange={onSearchChange}
          onPressEnter={onSearchSubmit}
          style={{ width: 200 }}
          value={searchQuery}
          allowClear
        />
        <div>
          Sort By{' '}
          <Select
            defaultValue="Featured"
            onChange={filterChanged}
            style={{ width: 150 }}
          >
            <Select.Option value="Featured">Featured</Select.Option>
            <Select.Option value="Popularity">Popularity</Select.Option>
            <Select.Option value="LastUpdated">Last Updated</Select.Option>
            <Select.Option value="Name">Name</Select.Option>
            <Select.Option value="Author">Author</Select.Option>
            <Select.Option value="TotalDownloads">
              Total Downloads
            </Select.Option>
          </Select>
        </div>
      </div>
      <div
        style={{
          height: 'calc(100% - 52px)',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <List
          className={styles.modsContainer}
          itemLayout="horizontal"
          loadMore={loadMore}
          dataSource={packs}
          renderItem={item => (
            <List.Item
              actions={[
                !item.loading && (
                  <Link
                    to={{
                      pathname: `/curseModpackBrowserCreatorModal/${item.id}`,
                      state: { modal: true }
                    }}
                  >
                    <Button type="primary" icon="download">
                      Download
                    </Button>
                  </Link>
                ),
                !item.loading && (
                  <Link
                    to={{
                      pathname: `/curseModpackExplorerModal/${item.id}`,
                      state: { modal: true }
                    }}
                  >
                    <Button type="primary">
                      Explore <Icon type="arrow-right" />
                    </Button>
                  </Link>
                )
              ]}
            >
              {item.loading ? (
                <ContentLoader
                  height={100}
                  speed={0.6}
                  ariaLabel={false}
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
                    <span>
                      <Link
                        to={{
                          pathname: `/curseModpackExplorerModal/${item.id}`,
                          state: { modal: true }
                        }}
                      >
                        {item.name}
                      </Link>{' '}
                      by {item.authors.join(', ')}
                    </span>
                  }
                  description={
                    item.loading ? (
                      ''
                    ) : (
                      <div>
                        <span style={{ maxWidth: 'calc(100% - 100px)' }}>
                          {/* Truncate the text if over 30 words */}
                          {item.summary.length >= 100
                            ? `${item.summary.slice(0, 100)}...`
                            : item.summary}
                        </span>
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
    </div>
  );
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...downloadManagerActions }, dispatch);
}

export default connect(
  null,
  mapDispatchToProps
)(CurseModpacksBrowser);
