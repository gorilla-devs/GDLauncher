import React, { memo, useState, useEffect } from "react";
import styled from "styled-components";
import { FixedSizeList as List, areEqual } from "react-window";
import { Checkbox, Input, Button, Switch } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faDownload } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import AutoSizer from "react-virtualized-auto-sizer";
import { _getInstance } from "../../utils/selectors";
import { faTwitch } from "@fortawesome/free-brands-svg-icons";

const Header = styled.div`
  height: 40px;
  width: 100%;
  background: ${props => props.theme.palette.grey[700]};
  display: flex;
  align-items: center;
  padding: 0 10px;
  justify-content: space-between;
`;

const Row = memo(
  ({ index, style, data }) => (
    <div
      index={index}
      css={`
        ${style}
        width: 100%;
        background: ${props =>
          props.theme.palette.grey[props.index % 2 ? 700 : 800]};
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 16px;
        padding: 0 10px;
      `}
    >
      <div>
        <Checkbox />
      </div>
      <div
        css={`
          flex: 1;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: color 0.1s ease-in-out;
          cursor: pointer;
          &:hover {
            color: ${props => props.theme.palette.primary.main};
          }
        `}
      >
        {data[index].id && (
          <FontAwesomeIcon
            css={`
              margin-right: 10px;
            `}
            icon={faTwitch}
          />
        )}
        {data[index].fileName}
      </div>
      <div
        css={`
          display: flex;
          justify-content: center;
          align-items: center;
        `}
      >
        <Switch
          size="small"
          css={`
            margin-right: 15px;
          `}
        />
        <FontAwesomeIcon
          css={`
            &:hover {
              cursor: pointer;
              path {
                cursor: pointer;
                transition: all 0.1s ease-in-out;
                color: ${props => props.theme.palette.error.main};
              }
            }
          `}
          icon={faTrash}
        />
      </div>
    </div>
  ),
  areEqual
);

const sort = arr =>
  arr.slice().sort((a, b) => a.fileName.localeCompare(b.fileName));

const filter = (arr, search) =>
  arr.filter(
    mod =>
      mod.fileName.toLowerCase().includes(search.toLowerCase()) ||
      mod.displayName.toLowerCase().includes(search.toLowerCase())
  );

const Mods = ({ instanceName }) => {
  const instance = useSelector(state => _getInstance(state)(instanceName));
  const [mods, setMods] = useState(sort(instance.mods));
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMods(filter(sort(instance.mods), search));
  }, [search, instance.mods]);

  return (
    <div
      css={`
        flex: 1;
      `}
    >
      <Header>
        <div
          css={`
            display: flex;
            justify-content: center;
            align-items: center;
          `}
        >
          <Checkbox>Select All</Checkbox>
          <FontAwesomeIcon
            css={`
              margin-left: 10px;
            `}
            icon={faTrash}
          />
          <Switch
            size="small"
            css={`
              margin-left: 10px;
            `}
          />
          <FontAwesomeIcon
            css={`
              margin-left: 10px;
            `}
            icon={faDownload}
          />
        </div>
        <Button type="primary">Add Mod</Button>
        <Input
          allowClear
          value={search}
          defaultValue={search}
          onChange={e => setSearch(e.target.value)}
          css={`
            width: 200px;
          `}
          placeholder={`Search ${mods.length} mods`}
        />
      </Header>
      <div
        css={`
          width: 100%;
          height: calc(100% - 40px);
        `}
      >
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              itemData={mods}
              itemCount={mods.length}
              itemSize={60}
              width={width}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      </div>
    </div>
  );
};

export default memo(Mods);
