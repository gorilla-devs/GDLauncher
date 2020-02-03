/* eslint-disable */
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Cascader } from "antd";
import styled from "styled-components";

const NewInstance = ({ setVersion, setModpack }) => {
  const vanillaManifest = useSelector(state => state.app.vanillaManifest);
  const fabricManifest = useSelector(state => state.app.fabricManifest);
  const forgeManifest = useSelector(state => state.app.forgeManifest);

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
      <Cascader
        options={filteredVersions}
        onChange={v => {
          setVersion(v);
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
