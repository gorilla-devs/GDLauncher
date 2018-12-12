import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import Link from 'react-router-dom/Link';
import axios from 'axios';
import ContentLoader from 'react-content-loader';
import path from 'path';
import log from 'electron-log';
import _ from 'lodash';
import {
  List,
  Avatar,
  Button,
  Input,
  Select,
  Icon,
  Popover,
  Tooltip
} from 'antd';
import { CURSEMETA_API_URL } from '../../constants';
import { numberToRoundedWord } from '../../utils/numbers';
import styles from './CurseModpacksBrowser.scss';

export default function CurseModpacksBrowser(props) {

  const [packs, setPacks] = useState([]);
  const [tempPacks, setTempPacks] = useState([]);
  const [filterType, setFilterType] = useState('Featured');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMorePacks();
  }, [])

  const loadMorePacks = async () => {

    setPacks(tempPacks.concat([...new Array(15)].map(() => ({ loading: true, name: null }))))

    const res = await axios.get(
      `${CURSEMETA_API_URL}/direct/addon/search?gameId=432&pageSize=15&index=${
      packs.length}&sort=${filterType}&searchFilter=${encodeURI(searchQuery)}&categoryId=0&sectionId=4471&sortDescending=${filterType !==
      'author' && filterType !== 'name'}`
    );
    console.log(`${CURSEMETA_API_URL}/direct/addon/search?gameId=432&pageSize=15&index=${
      packs.length}&sort=${filterType}&searchFilter=${encodeURI(searchQuery)}&gameVersion=${
      props.match.params.version}&categoryId=0&sectionId=4471&sortDescending=${filterType !==
      'author' && filterType !== 'name'}`)
    // We now remove the previous 10 elements and add the real 10
    const data = tempPacks.concat(res.data);

    setPacks(data);
    setTempPacks(data);
  };

  return (
    <div style={{ height: 'calc(100vh - 60px)' }}>
      <List
        className={styles.modsContainer}
        itemLayout="horizontal"
        loadMore={loadMorePacks}
        dataSource={packs}
        renderItem={item => (
          <List.Item
            actions={[]}
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
                  title={item.name}
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
};
