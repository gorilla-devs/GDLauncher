import React, { useState } from "react";
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
  position: relative;
  width: 180px;
  height: 100px;
  transform: ${p =>
    p.isHovered ? "scale3d(1.1, 1.1, 1.1)" : "scale3d(1, 1, 1)"};
  margin-right: 20px;
  margin-top: 20px;
  transition: transform 150ms ease-in-out;
  &:hover {
    ${p => (p.installing ? "" : "transform: scale3d(1.1, 1.1, 1.1);")}
  }
`;

const InstanceContainer = styled.div`
  display: flex;
  position: absolute;
  justify-content: center;
  align-items: center;
  text-align: center;
  width: 100%;
  font-size: 16px;
  height: 100%;
  background: linear-gradient(0deg,rgba(0,0,0,0.5),rgba(0,0,0,0.5)),url("${instanceDefaultBackground}");
  background-position: center;
  background-size: cover;
  border-radius: 4px;
  margin: 10px;
  `;

const HoverContainer = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 18px;
  margin: 10px;
  font-weight: 800;
  border-radius: 4px;
  transition: opacity 150ms ease-in-out;
  width: 100%;
  height: 100%;
  opacity: ${p => (p.installing || p.isHovered ? "1" : "0")};
  backdrop-filter: blur(4px);
  will-change: opacity;
  background: ${p => transparentize(0.5, p.theme.palette.grey[800])};
  &:hover {
    opacity: 1;
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
  const [isHovered, setIsHovered] = useState(false);
  const instance = useSelector(state => _getInstance(state)(instanceName));
  const downloadQueue = useSelector(_getDownloadQueue);
  const currentDownload = useSelector(state => state.currentDownload);
  const isInQueue = downloadQueue[instanceName];
  const instancesPath = useSelector(_getInstancesPath);
  const startInstance = () => {
    if (isInQueue) return;
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
        <Container
          installing={isInQueue}
          onClick={startInstance}
          isHovered={isHovered}
        >
          <InstanceContainer installing={isInQueue}>
            <MCVersion>{(instance.modloader || [])[1]}</MCVersion>
            {instance.name}
          </InstanceContainer>
          <HoverContainer installing={isInQueue} isHovered={isHovered}>
            {currentDownload === instanceName ? (
              <>
                <div
                  css={`
                    font-size: 14px;
                  `}
                >
                  {isInQueue ? isInQueue.status : null}
                </div>
                {`${isInQueue.percentage}%`}
              </>
            ) : (
              (isInQueue && "In Queue") || "PLAY"
            )}
          </HoverContainer>
        </Container>
      </ContextMenuTrigger>
      <ContextMenu
        id={instance.name}
        onShow={() => setIsHovered(true)}
        onHide={() => setIsHovered(false)}
      >
        <MenuItem>Manage</MenuItem>
        <MenuItem onClick={openFolder}>Open Folder</MenuItem>
        <MenuItem divider />
        <MenuItem onClick={openConfirmationDeleteModal}>Delete</MenuItem>
      </ContextMenu>
    </>
  );
};

export default Instance;
