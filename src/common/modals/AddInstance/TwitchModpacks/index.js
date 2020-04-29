/* eslint-disable */
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Select, Input } from 'antd';
import { useDebouncedCallback } from 'use-debounce';
import AutoSizer from 'react-virtualized-auto-sizer';
import { getSearch } from '../../../api';
import ModpacksListWrapper from './ModpacksListWrapper';
import { useSelector } from 'react-redux';

let lastRequest;
const TwitchModpacks = ({ setStep, setVersion, setModpack }) => {
  const mcVersions = useSelector(state => state.app.vanillaManifest?.versions);
  const categories = useSelector(state => state.app.curseforgeCategories);
  const [modpacks, setModpacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [minecraftVersion, setMinecraftVersion] = useState(null);
  const [categoryId, setCategoryId] = useState(null);
  const [sortBy, setSortBy] = useState('Featured');
  const [searchText, setSearchText] = useState('');
  const [hasNextPage, setHasNextPage] = useState(false);

  useEffect(() => {
    updateModpacks();
  }, [searchText, sortBy, minecraftVersion, categoryId]);

  const [updateModpacks] = useDebouncedCallback(() => {
    loadMoreModpacks(true);
  }, 500);

  const loadMoreModpacks = async (reset = false) => {
    if (loading) return;
    const reqObj = {};
    lastRequest = reqObj;
    setLoading(true);
    const { data } = await getSearch(
      'modpacks',
      searchText,
      40,
      reset ? 0 : modpacks.length,
      sortBy,
      true,
      minecraftVersion,
      categoryId
    );
    const newModpacks = reset ? data : [...modpacks, ...data];
    setLoading(false);
    if (lastRequest === reqObj) {
      setHasNextPage(newModpacks.length % 40 === 0);
      setModpacks(newModpacks);
    }
  };

  useEffect(() => {
    loadMoreModpacks();
  }, []);

  return (
    <Container>
      <HeaderContainer>
        <StyledSelect
          placeholder="Minecraft Version"
          onChange={setMinecraftVersion}
          defaultValue={null}
        >
          <Select.Option value={null}>All Versions</Select.Option>
          {(mcVersions || [])
            .filter(v => v?.type === 'release')
            .map(v => (
              <Select.Option key={v?.id} value={v?.id}>
                {v?.id}
              </Select.Option>
            ))}
        </StyledSelect>
        <StyledSelect
          placeholder="Minecraft Category"
          onChange={setCategoryId}
          defaultValue={null}
        >
          <Select.Option key={'allcategories'} value={null}>
            All Categories
          </Select.Option>
          {(categories || [])
            .filter(v => v?.rootGameCategoryId === 4471)
            .sort((a, b) => a?.name.localeCompare(b?.name))
            .map(v => (
              <Select.Option value={v?.id} key={v?.id}>
                <div
                  css={`
                    display: flex;
                    align-items: center;
                    width: 100%;
                    height: 100%;
                  `}
                >
                  <img
                    src={v?.avatarUrl}
                    css={`
                      height: 16px;
                      width: 16px;
                      margin-right: 10px;
                    `}
                  />
                  {v?.name}
                </div>
              </Select.Option>
            ))}
        </StyledSelect>
        <StyledSelect
          placeholder="Sort by"
          defaultValue="Featured"
          onChange={setSortBy}
        >
          <Select.Option key="Featured" value="Featured">
            Featured
          </Select.Option>
          <Select.Option key="Popularity" value="Popularity">
            Popularity
          </Select.Option>
          <Select.Option key="LastUpdated" value="LastUpdated">
            Last Updated
          </Select.Option>
          <Select.Option key="Name" value="Name">
            Name
          </Select.Option>
          <Select.Option key="Author" value="Author">
            Author
          </Select.Option>
          <Select.Option key="TotalDownloads" value="TotalDownloads">
            Total Downloads
          </Select.Option>
        </StyledSelect>
        <StyledInput
          placeholder="Search..."
          onSearch={setSearchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 200 }}
        />
      </HeaderContainer>
      <ModpacksContainer>
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
              setVersion={setVersion}
              setModpack={setModpack}
            />
          )}
        </AutoSizer>
      </ModpacksContainer>
    </Container>
  );
};

export default React.memo(TwitchModpacks);

const Container = styled.div`
  width: 100%;
  height: 100%;
`;

const StyledSelect = styled(Select)`
  width: 170px;
  margin-right: 20px;
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
