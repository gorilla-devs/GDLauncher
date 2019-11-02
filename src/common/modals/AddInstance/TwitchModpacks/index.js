/* eslint-disable */
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { Cascader, Select, Input } from "antd";
import { getSearch } from "../../../api";
import { transparentize } from "polished";

const TwitchModpacks = () => {
  const [modpacks, setModpacks] = useState([]);
  const updateModpacks = async () => {
    const { data } = await getSearch("modpacks", "", 40, 0, "Featured", true);
    setModpacks(data);
  };

  useEffect(() => {
    updateModpacks();
  }, []);

  console.log(modpacks);
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
        {modpacks.map(modpack => {
          const primaryImage = modpack.attachments.find(v => v.isDefault);
          return (
            <ModpackContainer bg={primaryImage.thumbnailUrl}>
              <Modpack>{modpack.name}</Modpack>
              <ModpackHover>
                <div>Download</div>
                <div>Explore</div>
              </ModpackHover>
            </ModpackContainer>
          );
        })}
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

const ModpackContainer = styled.div`
  position: relative;
  width: 100%;
  height: 60px;
  background: url('${props => props.bg}');
  background-repeat: no-repeat;
  background-size: cover;
  margin: 10px 0;
`;

const Modpack = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  font-size: 16px;
  padding: 0 10px;
  background: ${props => transparentize(0.4, props.theme.palette.grey[700])};
`;

const ModpackHover = styled.div`
  position: absolute;
  display: flex;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(4px);
  background: ${props => transparentize(0.7, props.theme.palette.grey[700])};
  opacity: 0;
  padding-left: 40%;
  will-change: opacity;
  transition: opacity 0.1s ease-in-out, background 0.1s ease-in-out;
  div {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    background-color: transparent;
    border-radius: 4px;
    transition: background-color 0.1s ease-in-out;
    &:hover {
      background-color: ${props => props.theme.palette.primary.main};
    }
  }
  &:hover {
    opacity: 1;
  }
`;
