/* eslint-disable */
import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { MenuItem, Checkbox, TextField, Cascader } from "antd";
import Modal from "../components/Modal";

const AddInstance = () => {
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
    <Modal
      css={`
        height: 70%;
        width: 70%;
        max-width: 1500px;
      `}
      title="Add New Instance"
    >
      <div
        css={`
          width: 100%;
          display: flex;
          justify-content: center;
        `}
      >
        <Cascader options={filteredVersions} placeholder="Select a version" />
      </div>
    </Modal>
  );
};

export default React.memo(AddInstance);
