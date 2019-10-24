/* eslint-disable */
import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { MenuItem, Checkbox, TextField } from "antd";
import Modal from "../components/Modal";

const AddInstance = () => {
  const [includeSnapshots, setIncludeSnapshots] = useState(false);
  const [includeBetas, setIncludeBetas] = useState(false);
  const [includeAlphas, setIncludeAlphas] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState("");
  const [selectOpen, setSelectOpen] = useState(false);

  const vanillaManifest = useSelector(state => state.app.vanillaManifest);

  const filteredVersions = useMemo(() => {
    let { versions } = vanillaManifest;
    if (includeBetas) {
      versions = versions.concat(
        vanillaManifest.versions.filter(v => v.type === "old_beta")
      );
    }
    if (includeAlphas) {
      versions = versions.concat(
        vanillaManifest.versions.filter(v => v.type === "old_alpha")
      );
    }
    return versions;
  }, [vanillaManifest, includeSnapshots]);

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
          align-items: center;
          justify-content: center;
        `}
      >
        <div
          css={`
            height: 100px;
            width: 100px;
          `}
        >
          Vanilla version
          <Checkbox
            css={`
              position: relative;
              top: 20px;
              margin-left: 25px;
            `}
            color="primary"
            onClick={() => setIncludeSnapshots(!includeSnapshots)}
          />
          <div
            css={`
              position: relative;
              top: 25px;
              margin-left: 15px;
            `}
          >
            Snapshots
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default React.memo(AddInstance);
