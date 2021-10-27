import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Input } from 'antd';
import { useDebouncedCallback } from 'use-debounce';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBomb, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import ModpacksListWrapper from './ModpacksListWrapper';
import {
  getTechnicModpackData,
  getTechnicSearch,
  getTechnicSolderData,
  getTechnicSolderMultiple
} from '../../../api';
import { TECHNIC_SOLDER_API_URL } from '../../../utils/constants';

let lastRequest;
const TechnicModpacks = ({ setStep, setVersion, setModpack }) => {
  const infiniteLoaderRef = useRef(null);
  const [modpacks, setModpacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState(false);

  const updateModpacks = useDebouncedCallback(() => {
    if (infiniteLoaderRef?.current?.scrollToItem) {
      infiniteLoaderRef.current.scrollToItem(0);
    }
    loadMoreModpacks(true);
  }, 250);

  const loadMoreModpacks = async (reset = false) => {
    const reqObj = {};
    lastRequest = reqObj;
    if (!loading) {
      setLoading(true);
    }
    if (reset && modpacks.length !== 0) {
      setModpacks([]);
    }
    let data = null;
    try {
      if (error) {
        setError(false);
      }
      if (searchText) {
        const modpackNames = (
          await getTechnicSearch(searchText)
        ).data.modpacks.map(m => m.slug);
        data = await Promise.all(
          modpackNames.map(
            async name => (await getTechnicModpackData(name)).data
          )
        );
        for (const modpack of data) {
          if (modpack.solder) {
            try {
              const solderResponse = await getTechnicSolderData(
                modpack.solder,
                'modpack',
                modpack.name
              );
              const solderData = solderResponse.data;
              modpack.builds = solderData.builds;
              modpack.latest = solderData.latest;
              modpack.recommended = solderData.recommended;
              modpack.homeUrl = solderData.url;
              modpack.solderLogo = solderData.logo;
              modpack.solderBackground = solderData.background;
            } catch (e) {
              // Broken solder link
              console.log(e);
            }
          }
        }
      } else {
        const { modpacks: solderModpacks } = (
          await getTechnicSolderMultiple(TECHNIC_SOLDER_API_URL, 'modpack')
        ).data;
        data = await Promise.all(
          Object.values(solderModpacks).map(async modpack => {
            return {
              ...(await getTechnicModpackData(modpack.name)).data,
              builds: modpack.builds,
              latest: modpack.latest,
              recommended: modpack.recommended,
              homeUrl: modpack.url,
              solderLogo: modpack.logo,
              solderBackground: modpack.background
            };
          })
        );
      }
    } catch (err) {
      setError(err);
      return;
    }
    const newModpacks = reset ? data : [...modpacks, ...data];
    if (lastRequest === reqObj) {
      setLoading(false);
      setModpacks(newModpacks);
    }
  };

  useEffect(() => {
    updateModpacks();
  }, [searchText]);

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
        {/* eslint-disable-next-line no-nested-ternary */}
        {!error ? (
          !loading && modpacks.length === 0 ? (
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
                  hasNextPage={false}
                  isNextPageLoading={loading}
                  items={modpacks}
                  loadNextPage={loadMoreModpacks}
                  width={width}
                  height={height}
                  setStep={setStep}
                  setVersion={setVersion}
                  setModpack={setModpack}
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

export default React.memo(TechnicModpacks);

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
