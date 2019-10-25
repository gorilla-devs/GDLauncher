import React from "react";
import { transparentize } from "polished";
import styled from "styled-components";
import path from "path";
import { shell } from "electron";
import { ContextMenuTrigger, ContextMenu, MenuItem } from "react-contextmenu";
import { useSelector, useDispatch } from "react-redux";
import {
  _getInstance,
  _getInstancesPath,
  _getDownloadQueue
} from "../../../../common/utils/selectors";
import { launchInstance } from "../../../../common/reducers/actions";
import { openModal } from "../../../../common/reducers/modals/actions";
import instanceDefaultBackground from "../../../../common/assets/instance_default.png";

const Container = styled.div`
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  text-align: center;
  width: 180px;
  height: 100px;
  background: linear-gradient(0deg,rgba(0,0,0,0.5),rgba(0,0,0,0.5)),url("${instanceDefaultBackground}");
  background-position: center;
  background-size: cover;
  border-radius: 4px;
  margin: 10px;
  cursor: pointer;
  transform: scale3d(1, 1, 1);
  transition: transform 150ms ease-in-out;
  &:after {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
    font-weight: 800;
    border-radius: 4px;
    transition: opacity 150ms ease-in-out;
    width: 100%;
    height: 100%;
    opacity: ${p => (p.installing ? "1" : "0")};
    backdrop-filter: blur(4px);
    will-change: opacity;
    background: ${p => transparentize(0.5, p.theme.palette.grey[800])};
    content: "${p => (p.installing || {}).percentage || "PLAY"}";
  }
  &:hover {
    ${p => (p.installing ? "" : "transform: scale3d(1.1, 1.1, 1.1);")}
    &:after {
      opacity: 1;
    }
  }
`;

const MCVersion = styled.div`
  position: absolute;
  right: 5px;
  top: 5px;
  font-size: 11px;
`;

const Instance = ({ instanceName }) => {
  const dispatch = useDispatch();
  const instance = useSelector(state => _getInstance(state)(instanceName));
  const downloadQueue = useSelector(_getDownloadQueue);
  const isInQueue = downloadQueue[instanceName];
  const instancesPath = useSelector(_getInstancesPath);
  const startInstance = () => {
    dispatch(launchInstance(instanceName));
  };
  const openFolder = () => {
    shell.openItem(path.join(instancesPath, instance.name));
  };
  const openConfirmationDeleteModal = () => {
    dispatch(openModal("InstanceDeleteConfirmation", { instanceName }));
  };
  return (
    <>
      <ContextMenuTrigger id={instance.name}>
        <Container installing={isInQueue} onClick={startInstance}>
          <MCVersion>{instance.mcVersion}</MCVersion>
          {instance.name}
        </Container>
      </ContextMenuTrigger>
      <ContextMenu id={instance.name}>
        <MenuItem>Manage</MenuItem>
        <MenuItem onClick={openFolder}>Open Folder</MenuItem>
        <MenuItem divider />
        <MenuItem onClick={openConfirmationDeleteModal}>Delete</MenuItem>
      </ContextMenu>
    </>
  );
};

export default Instance;
