/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Input } from 'antd';
import { useDebouncedCallback } from 'use-debounce';
import AutoSizer from 'react-virtualized-auto-sizer';
import ModpacksListWrapper from './ModpacksListWrapper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBomb, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import {
  getFTBModpackData,
  getFTBMostPlayed,
  getFTBSearch
} from '../../../api';
import pMap from 'p-map';

let lastRequest;
const FTBModpacks = ({ setStep, setModpack, setVersion }) => {
  const infiniteLoaderRef = useRef(null);
  const [modpackIds, setModpackIds] = useState([]);
  const [modpacks, setModpacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const init = async () => {
      let data;
      if (searchText.length < 3) {
        ({ data } = await getFTBMostPlayed());
      } else {
        ({ data } = await getFTBSearch(searchText));
      }
      setModpackIds(data.packs || []);
      updateModpacks();
    };
    init().catch(e => {
      setError(e);
    });
  }, [searchText]);

  const updateModpacks = useDebouncedCallback(() => {
    if (infiniteLoaderRef?.current?.scrollToItem) {
      infiniteLoaderRef.current.scrollToItem(0);
    }
    loadMoreModpacks(true);
  }, 250);

  const loadMoreModpacks = async (reset = false) => {
    if (modpackIds.length === 0) return;
    const reqObj = {};
    lastRequest = reqObj;
    if (!loading) {
      setLoading(true);
    }
    if (reset && (modpacks.length !== 0 || hasNextPage)) {
      setModpacks([]);
      setHasNextPage(false);
    }
    let data = null;
    try {
      if (error) {
        setError(false);
      }
      const idsToFetch = modpackIds.slice(
        modpacks.length,
        modpacks.length + 20
      );
      data = await pMap(idsToFetch, getFTBModpackData);
    } catch (err) {
      setError(err);
      return;
    }
    const newModpacks = (reset ? data : [...modpacks, ...data]).filter(
      v => v.status !== 'error'
    );
    if (lastRequest === reqObj) {
      setLoading(false);
      setHasNextPage(newModpacks.length % 20 === 0 && newModpacks.length !== 0);
      setModpacks(newModpacks);
    }
  };

  return (
    <Container>
      <HeaderContainer>
        <StyledInput
          placeholder="Search..."
          onSearch={setSearchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 200 }}
        />
      </HeaderContainer>
      <ModpacksContainer>
        {!error ? (
          !loading && modpacks.length == 0 ? (
            <div
              css={`
                margin-top: 120px;
                display: flex;
                flex-direction: column;
                align-items: center;
                font-size: 150px;
              `}
            >
              <FontAwesomeIcon icon={faExclamationCircle} />
              <div
                css={`
                  font-size: 20px;
                  margin-top: 70px;
                `}
              >
                No modpack has been found with the current filters.
              </div>
            </div>
          ) : (
            <AutoSizer>
              {({ height, width }) => (
                <ModpacksListWrapper
                  hasNextPage={hasNextPage}
                  isNextPageLoading={loading}
                  items={modpacks}
                  loadNextPage={loadMoreModpacks}
                  width={width}
                  height={height}
                  setStep={setStep}
                  setModpack={setModpack}
                  setVersion={setVersion}
                  infiniteLoaderRef={infiniteLoaderRef}
                />
              )}
            </AutoSizer>
          )
        ) : (
          <div
            css={`
              margin-top: 120px;
              display: flex;
              flex-direction: column;
              align-items: center;
              font-size: 150px;
            `}
          >
            <FontAwesomeIcon icon={faBomb} />
            <div
              css={`
                font-size: 20px;
                margin-top: 70px;
              `}
            >
              An error occurred while loading the modpacks list...
            </div>
          </div>
        )}
      </ModpacksContainer>
    </Container>
  );
};

export default React.memo(FTBModpacks);

const Container = styled.div`
  width: 100%;
  height: 100%;
`;

const StyledInput = styled(Input.Search)``;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const ModpacksContainer = styled.div`
  height: calc(100% - 15px);
  overflow: hidden;
  padding: 10px 0;
`;
