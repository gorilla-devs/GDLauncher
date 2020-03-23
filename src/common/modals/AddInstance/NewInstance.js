/* eslint-disable */
import React, { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Cascader, Checkbox, Select } from "antd";
import makeDir from "make-dir";
import path from "path";
import styled from "styled-components";
import axios from "axios";
import { downloadFile } from "../../../app/desktop/utils/downloader";
import { _getOptifineVersionsPath } from "../../utils/selectors";

const NewInstance = ({
  setVersion,
  setModpack,
  version,
  setOptifineVersion,
  optifineVersion
}) => {
  const vanillaManifest = useSelector(state => state.app.vanillaManifest);
  const fabricManifest = useSelector(state => state.app.fabricManifest);
  const forgeManifest = useSelector(state => state.app.forgeManifest);
  const optifineManifest = useSelector(state => state.app.optifineManifest);
  const [minecraftVersion, setMinecraftVersion] = useState(null);
  const [optifineSwitch, setOptifineSwitch] = useState(false);
  const [optifineDefaultValue, setOptifineDefaultValue] = useState(null);

  const optifineVersionsPath = useSelector(_getOptifineVersionsPath);

  useEffect(() => {
    if (
      optifineSwitch &&
      minecraftVersion &&
      minecraftVersion[0] === "vanilla" &&
      minecraftVersion[1] === "release"
    ) {
      if (optifineManifest[minecraftVersion[2]]) {
        setOptifineDefaultValue(optifineManifest[minecraftVersion[2]][0].name);
        setOptifineVersion(optifineManifest[minecraftVersion[2]][0].name);
      }
    } else if (minecraftVersion && minecraftVersion[0] === "forge") {
      if (optifineManifest[minecraftVersion[1]]) {
        setOptifineDefaultValue(optifineManifest[minecraftVersion[1]][0].name);
        setOptifineVersion(optifineManifest[minecraftVersion[1]][0].name);
      }
    }
  }, [minecraftVersion]);

  // const downloadOptifine = async optifineVersionName => {
  //   await makeDir(optifineVersionsPath);
  //   const url = optifineManifest[optifineVersionName.split(" ")[1]].filter(
  //     x => x.name === optifineVersionName
  //   )[0].download;
  //   const html = await axios.get(url);
  //   const ret = /<a href='downloadx\?(.+?)'/.exec(html.data);
  //   console.log(ret);
  //   if (ret && ret[1]) {
  //     downloadFile(
  //       path.join(optifineVersionsPath, `${optifineVersionName}.jar`),
  //       "https://optifine.net/downloadx?" + ret[1]
  //     );
  //   }
  // };

  const filterOptifineVersione = () => {
    // console.log("P", minecraftVersion, optifineManifest);
    if (
      minecraftVersion &&
      minecraftVersion[0] === "vanilla" &&
      minecraftVersion[1] === "release"
    ) {
      if (optifineManifest[minecraftVersion[2]]) {
        return optifineManifest[minecraftVersion[2]].map(x => {
          return <Option value={x.name}>{x.name}</Option>;
        });
      }
    } else if (minecraftVersion && minecraftVersion[0] === "forge") {
      if (optifineManifest[minecraftVersion[1]]) {
        return optifineManifest[minecraftVersion[1]].map(x => {
          return <Option value={x.name}>{x.name}</Option>;
        });
      }
    }
  };

  const { Option } = Select;

  const filteredVersions = useMemo(() => {
    const snapshots = vanillaManifest.versions
      .filter(v => v.type === "snapshot")
      .map(v => v.id);
    const versions = [
      {
        value: "vanilla",
        label: "Vanilla",
        children: [
          {
            value: "release",
            label: "Releases",
            children: vanillaManifest.versions
              .filter(v => v.type === "release")
              .map(v => ({
                value: v.id,
                label: v.id
              }))
          },
          {
            value: "snapshot",
            label: "Snapshots",
            children: vanillaManifest.versions
              .filter(v => v.type === "snapshot")
              .map(v => ({
                value: v.id,
                label: v.id
              }))
          },
          {
            value: "old_beta",
            label: "Old Beta",
            children: vanillaManifest.versions
              .filter(v => v.type === "old_beta")
              .map(v => ({
                value: v.id,
                label: v.id
              }))
          },
          {
            value: "old_alpha",
            label: "Old Alpha",
            children: vanillaManifest.versions
              .filter(v => v.type === "old_alpha")
              .map(v => ({
                value: v.id,
                label: v.id
              }))
          }
        ]
      },
      {
        value: "forge",
        label: "Forge",
        children: Object.entries(forgeManifest).map(([k, v]) => ({
          value: k,
          label: k,
          children: v.map(child => ({
            value: child,
            label: child
          }))
        }))
      },
      {
        value: "fabric",
        label: "Fabric",
        children: [
          {
            value: "release",
            label: "Releases",
            children: fabricManifest.mappings
              .filter(v => !snapshots.includes(v.gameVersion))
              .map(v => ({
                value: v.version,
                label: v.version,
                children: fabricManifest.loader.map(c => ({
                  value: c.version,
                  label: c.version
                }))
              }))
          },
          {
            value: "snapshot",
            label: "Snapshots",
            children: fabricManifest.mappings
              .filter(v => snapshots.includes(v.gameVersion))
              .map(v => ({
                value: v.version,
                label: v.version,
                children: fabricManifest.loader.map(c => ({
                  value: c.version,
                  label: c.version
                }))
              }))
          }
        ]
      }
    ];
    return versions;
  }, [vanillaManifest, fabricManifest, forgeManifest]);

  return (
    <Container>
      <div
        css={`
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          width: 400px;
        `}
      >
        <Cascader
          options={filteredVersions}
          onChange={v => {
            setVersion(v);
            setMinecraftVersion(v);
            setModpack(null);
          }}
          placeholder="Select a version"
          size="large"
          css={`
            && {
              width: 400px;
            }
          `}
        />
        <div
          css={`
            margin-top: 30px;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          `}
        >
          <Checkbox
            value={optifineSwitch}
            onChange={e => setOptifineSwitch(e.target.checked)}
          />
          {optifineSwitch && (
            <Select
              onChange={v => {
                // downloadOptifine(v);
                if (!v) {
                  setOptifineVersion(optifineDefaultValue);
                } else setOptifineVersion(v);
                console.log("version", v, optifineDefaultValue);
              }}
              value={
                optifineDefaultValue
                  ? optifineDefaultValue
                  : "No optifine available for this version"
              }
              placeholder="Select an optifine version"
              size="large"
              css={`
                && {
                  width: 200px;
                }
              `}
            >
              {filterOptifineVersione()}
            </Select>
          )}
        </div>
      </div>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

export default React.memo(NewInstance);
