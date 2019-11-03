/* eslint-disable */
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Select, Input } from "antd";
import { useDebounce } from "rooks";
import AutoSizer from "react-virtualized-auto-sizer";
import { getSearch } from "../../../api";
import ModpacksListWrapper from "./ModpacksListWrapper";

const TwitchModpacks = ({ setStep, setVersion }) => {
  const [modpacks, setModpacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("Featured");
  const [searchText, setSearchText] = useState("");
  const [hasNextPage, setHasNextPage] = useState(false);

  useEffect(() => {
    updateModpacks();
  }, [searchText, sortBy]);

  const updateModpacks = useDebounce(() => {
    loadMoreModpacks(true);
  }, 500);

  const loadMoreModpacks = async (reset = false) => {
    setLoading(true);
    const { data } = await getSearch(
      "modpacks",
      searchText,
      40,
      reset ? 0 : modpacks.length,
      sortBy,
      true
    );
    const newModpacks = reset ? data : [...modpacks, ...data];
    setLoading(false);
    setHasNextPage(newModpacks.length % 40 === 0);
    setModpacks(newModpacks);
  };

  useEffect(() => {
    loadMoreModpacks();
  }, []);

  return (
    <Container>
      <HeaderContainer>
        <StyledSelect placeholder="Minecraft Version" />
        <StyledSelect
          placeholder="Sort by"
          defaultValue="Featured"
          onChange={setSortBy}
        >
          <Select.Option value="Featured">Featured</Select.Option>
          <Select.Option value="Popularity">Popularity</Select.Option>
          <Select.Option value="LastUpdated">Last Updated</Select.Option>
          <Select.Option value="Name">Name</Select.Option>
          <Select.Option value="Author">Author</Select.Option>
          <Select.Option value="TotalDownloads">Total Downloads</Select.Option>
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
  && {
    width: 170px;
    margin-right: 20px;
  }
`;

const StyledInput = styled(Input.Search)``;

const HeaderContainer = styled.div``;

const ModpacksContainer = styled.div`
  height: calc(100% - 15px);
  overflow-y: auto;
  padding: 10px 0;
`;
