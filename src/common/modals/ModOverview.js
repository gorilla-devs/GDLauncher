/* eslint-disable */
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import ReactHtmlParser from "react-html-parser";
import { Checkbox, TextField, Cascader, Button, Input, Select } from "antd";
import Modal from "../components/Modal";
import { transparentize } from "polished";
import { getAddonDescription, getAddonFiles, getAddon } from "../api";
import CloseButton from "../components/CloseButton";
import { closeModal } from "../reducers/modals/actions";

const ModOverview = ({ projectID, fileID, gameVersion }) => {
  const dispatch = useDispatch();
  const [description, setDescription] = useState(null);
  const [addon, setAddon] = useState(null);
  const [files, setFiles] = useState(null);
  const [selectedId, setSelectedId] = useState(fileID);
  useEffect(() => {
    getAddon(projectID).then(data => setAddon(data.data));
    getAddonDescription(projectID).then(data => setDescription(data.data));
    getAddonFiles(projectID).then(data => {
      setFiles(
        data.data.filter(file => file.gameVersion.includes(gameVersion))
      );
    });
  }, []);

  const handleChange = value => setSelectedId(value);

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
          <StyledSelect
            placeholder="Select a version"
            value={selectedId}
            onChange={handleChange}
          >
            {(files || []).map(file => (
              <Select.Option
                title={file.displayName}
                key={file.id}
                value={file.id}
              >
                {file.displayName}
              </Select.Option>
            ))}
          </StyledSelect>
          <Button
            type="primary"
            disabled={!selectedId || fileID === selectedId}
            onClick={() => {
              //   const modpackFile = files.find(file => file.id === selectedId);
              //   dispatch(closeModal());
              //   setVersion(["twitchModpack", modpack.id, modpackFile.id]);
              //   setModpack(modpack);
              //   setStep(1);
            }}
          >
            {fileID ? "Switch Version" : "Download"}
          </Button>
        </Footer>
      </>
    </Modal>
  );
};

export default React.memo(ModOverview);

const StyledSelect = styled(Select)`
  && {
    width: 250px;
  }
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
