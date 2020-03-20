/* eslint-disable */
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import ReactHtmlParser from "react-html-parser";
import path from "path";
import { Checkbox, TextField, Cascader, Button, Input, Select } from "antd";
import Modal from "../components/Modal";
import { transparentize } from "polished";
import { getAddonDescription, getAddonFiles, getAddon } from "../api";
import CloseButton from "../components/CloseButton";
import { closeModal } from "../reducers/modals/actions";
import { installMod, updateInstanceConfig } from "../reducers/actions";
import { remove } from "fs-extra";
import { _getInstancesPath } from "../utils/selectors";

const ModOverview = ({
  projectID,
  fileID,
  gameVersion,
  instanceName,
  fileName
}) => {
  const dispatch = useDispatch();
  const [description, setDescription] = useState(null);
  const [addon, setAddon] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedItem, setSelectedItem] = useState({ fileID, fileName });
  const [installedData, setInstalledData] = useState({ fileID, fileName });
  const [loading, setLoading] = useState(false);
  const instancesPath = useSelector(_getInstancesPath);
  useEffect(() => {
    getAddon(projectID).then(data => setAddon(data.data));
    getAddonDescription(projectID).then(data => setDescription(data.data));
    getAddonFiles(projectID).then(data => {
      setFiles(
        data.data.filter(file => file.gameVersion.includes(gameVersion))
      );
    });
  }, []);

  const handleChange = value => setSelectedItem(JSON.parse(value));

  const primaryImage = (addon?.attachments || []).find(v => v.isDefault);
  return (
    <Modal
      css={`
        height: 85%;
        width: 85%;
        max-width: 1500px;
      `}
      header={false}
    >
      <>
        <StyledCloseButton>
          <CloseButton onClick={() => dispatch(closeModal())} />
        </StyledCloseButton>
        <Container>
          <Parallax bg={primaryImage?.url}>
            <ParallaxContent>{addon?.name}</ParallaxContent>
          </Parallax>
          <Content>{ReactHtmlParser(description)}</Content>
        </Container>
        <Footer>
          {installedData.fileID &&
            files.length !== 0 &&
            !files.find(v => v.id === installedData.fileID) && (
              <div
                css={`
                  color: ${props => props.theme.palette.colors.yellow};
                  font-weight: 700;
                `}
              >
                The installed version of this mod has been removed from twitch,
                so you will only be able to get it as part of legacy modpacks.
              </div>
            )}
          <StyledSelect
            placeholder="Select a version"
            value={
              files.length !== 0 &&
              files.find(v => v.id === installedData.fileID) &&
              JSON.stringify(selectedItem)
            }
            onChange={handleChange}
          >
            {(files || []).map(file => (
              <Select.Option
                title={file.displayName}
                key={file.id}
                value={JSON.stringify({
                  fileID: file.id,
                  fileName: file.fileName
                })}
              >
                {file.displayName}
              </Select.Option>
            ))}
          </StyledSelect>
          <Button
            type="primary"
            disabled={
              !selectedItem.fileID ||
              installedData.fileID === selectedItem.fileID
            }
            loading={loading}
            onClick={async () => {
              setLoading(true)
              if (installedData.fileID) {
                await dispatch(
                  updateInstanceConfig(instanceName, prev => ({
                    ...prev,
                    mods: prev.mods.filter(
                      v => v.fileID !== installedData.fileID
                    )
                  }))
                );
                await remove(
                  path.join(
                    instancesPath,
                    instanceName,
                    "mods",
                    installedData.fileName
                  )
                );
              }
              await dispatch(
                installMod(
                  projectID,
                  selectedItem.fileID,
                  instanceName,
                  gameVersion,
                  !installedData.fileID
                )
              );
              setInstalledData(selectedItem);
              setLoading(false);
            }}
          >
            {installedData.fileID ? "Switch Version" : "Download"}
          </Button>
        </Footer>
      </>
    </Modal>
  );
};

export default React.memo(ModOverview);

const StyledSelect = styled(Select)`
  width: 300px;
  min-width: 300px;
`;

const StyledCloseButton = styled.div`
  position: absolute;
  top: 30px;
  right: 30px;
  z-index: 1;
`;

const Container = styled.div`
  perspective: 1px;
  transform-style: preserve-3d;
  height: calc(100% - 70px);
  width; 100%;
  overflow-x: hidden;
  overflow-y: scroll;
`;

const Parallax = styled.div`
  display: flex;
  flex: 1 0 auto;
  position: relative;
  height: 100%;
  width: 100%;
  transform: translateZ(-1px) scale(2);
  z-index: -1;
  background: url('${props => props.bg}');
  background-repeat: no-repeat;
  background-size: cover;
`;

const ParallaxContent = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 60px;
  color: ${props => props.theme.palette.text.secondary};
  font-weight: 700;
  padding: 0 30px;
  text-align: center;
  background: rgba(0, 0, 0, 0.8);
`;

const Content = styled.div`
  min-height: 100%;
  height: auto;
  display: block;
  padding: 30px 30px 90px 30px;
  font-size: 18px;
  position: relative;
  p {
    text-align: center;
  }
  img {
    max-width: 100%;
    height: auto;
  }
  pre {
    background: ${props => transparentize(0.2, props.theme.palette.grey[900])};
  }
  z-index: 1;
  backdrop-filter: blur(20px);
  background: ${props => transparentize(0.4, props.theme.palette.grey[900])};
`;

const Footer = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  bottom: 0;
  left: 0;
  height: 70px;
  width: 100%;
  background: ${props => props.theme.palette.grey[700]};
  && > * {
    margin: 0 10px;
  }
`;
