/* eslint-disable */
import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import { Checkbox, TextField, Cascader, Button, Input } from "antd";
import Modal from "../../components/Modal";
import TwitchModpacks from "./TwitchModpacks";
import Import from "./Import";
import NewInstance from "./NewInstance";
import { addToQueue } from "../../reducers/actions";
import { closeModal } from "../../reducers/modals/actions";

const AddInstance = () => {
  // 0 -> default
  // 1 -> twitch modpacks
  // 2 -> import
  const [page, setPage] = useState(0);
  const [version, setVersion] = useState(null);
  const [instanceName, setInstanceName] = useState("");
  const dispatch = useDispatch();
  const fabricManifest = useSelector(state => state.app.fabricManifest);

  let pages = [
    <NewInstance setVersion={setVersion} />,
    <TwitchModpacks setVersion={setVersion} />,
    <Import setVersion={setVersion} />
  ];

  const createInstance = () => {
    if (!version || !instanceName) return;
    const isVanilla = version[0] === "vanilla";
    const isFabric = version[0] === "fabric";
    const isForge = version[0] === "forge";
    if (isVanilla) {
      dispatch(addToQueue(instanceName, version[2]));
    } else if (isFabric) {
      const mappedItem = fabricManifest.mappings.find(
        v => v.version === version[2]
      );
      const splitItem = version[2].split(mappedItem.separator);
      dispatch(
        addToQueue(instanceName, splitItem[0], [
          "fabric",
          version[2],
          version[3]
        ])
      );
    } else if (isForge) {
    }
    dispatch(closeModal());
  };

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
          height: 100%;
          display: flex;
        `}
      >
        <div
          css={`
            flex: 5;
            height: 100%;
          `}
        >
          {pages[page]}
        </div>
        <div
          css={`
            flex: 2;
            position: relative;
            height: 100%;
          `}
        >
          <MenuItem active={page === 0} onClick={() => setPage(0)}>
            Create New Instance
          </MenuItem>
          <MenuItem active={page === 1} onClick={() => setPage(1)}>
            Browse Twitch Modpacks
          </MenuItem>
          <MenuItem active={page === 2} onClick={() => setPage(2)}>
            Import from other Launchers
          </MenuItem>
          <div
            css={`
              position: absolute;
              bottom: 0;
              right: 0;
            `}
          >
            <Input
              css={`
                && {
                  margin-bottom: 30px;
                }
              `}
              placeholder="Instance Name"
              value={instanceName}
              onChange={e => setInstanceName(e.target.value)}
            />
            <Button onClick={createInstance}>Create Instance</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default React.memo(AddInstance);

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  color: white;
  border-radius: 4px;
  padding: 0 4px;
  cursor: pointer;
  ${props =>
    props.active ? `background: ${props.theme.palette.grey[500]};` : ""}
  transition: background 0.1s ease-in-out;
  &:hover {
    background: ${props => props.theme.palette.grey[500]};
  }
`;
