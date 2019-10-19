import React, { useState } from "react";
import { useSelector } from "react-redux";
import Button from "@material-ui/core/Button";
import Select from "@material-ui/core/Select";
import CheckBox from "@material-ui/core/CheckBox";
// import { CheckBox } from "../../ui";
import Modal from "../components/Modal";
import MenuItem from "@material-ui/core/MenuItem";

const AddInstance = () => {
  const [snapshot, setSnapshot] = useState(false);
  const [version, setVersion] = useState("");

  const vanillaManifest = useSelector(state => state.app.vanillaManifest);
  console.log(vanillaManifest);
  return (
    <Modal
      css={`
        height: 70%;
        width: 70%;
        max-width: 1500px;
      `}
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
          <Select
            css={`
              margin-left: 25px;
            `}
            value={version}
            onChange={e => setVersion(e.target.value)}
          >
            {/* {vanillaManifest.versions
          .filter(versions =>
            // versions => versions.type === "release"
            snapshot ? versions.type === "snapshot" : true
          )
          .map((version, i) => (
            <MenuItem key={version.id} value={i}>
              {version.id}
            </MenuItem>
          ))} */}

            {snapshot
              ? vanillaManifest.versions.map((version, i) => (
                  <MenuItem key={version.id} value={i}>
                    {version.id}
                  </MenuItem>
                ))
              : vanillaManifest.versions
                  .filter(versions => versions.type === "release")
                  .map((version, i) => (
                    <MenuItem key={version.id} value={i}>
                      {version.id}
                    </MenuItem>
                  ))}
          </Select>
          <CheckBox
            css={`
              position: relative;
              top: 20px;
              margin-left: 25px;
            `}
            onClick={() => setSnapshot(!snapshot)}
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

export default AddInstance;
