/* eslint-disable */
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Select, Input } from "antd";
import { transparentize } from "polished";
import AutoSizer from "react-virtualized-auto-sizer";
import { getSearch } from "../../../api";
import ModpacksListWrapper from "./ModpacksListWrapper";

const TwitchModpacks = ({ setStep }) => {
  const [modpacks, setModpacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const loadMoreModpacks = async () => {
    setLoading(true);
    const { data } = await getSearch(
      "modpacks",
      "",
      40,
      modpacks.length,
      "Featured",
      true
    );
    setLoading(false);
    setHasNextPage([...modpacks, ...data].length % 40 === 0);
    setModpacks([...modpacks, ...data]);
  };

  useEffect(() => {
    loadMoreModpacks();
  }, []);

  return (
    <Container>
      <HeaderContainer>
        <StyledSelect placeholder="Minecraft Version" />
        <StyledSelect placeholder="Sort by" />
        <StyledInput
          placeholder="Search..."
          onSearch={value => console.log(value)}
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
