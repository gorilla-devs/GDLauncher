/* eslint-disable */
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import ReactHtmlParser from 'react-html-parser';
import { Checkbox, TextField, Cascader, Button, Input, Select } from 'antd';
import Modal from '../components/Modal';
import { transparentize } from 'polished';
import { getAddonDescription, getAddonFiles } from '../api';
import CloseButton from '../components/CloseButton';
import { closeModal } from '../reducers/modals/actions';
import { FORGE } from '../utils/constants';

const AddInstance = ({ modpack, setStep, setModpack, setVersion }) => {
  const dispatch = useDispatch();
  const [description, setDescription] = useState(null);
  const [files, setFiles] = useState(null);
  const [selectedId, setSelectedId] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAddonDescription(modpack.id).then(data => setDescription(data.data));
    getAddonFiles(modpack.id).then(data => {
      setFiles(data.data);
      setLoading(false);
    });
  }, []);

  const handleChange = value => setSelectedId(value);

  const getReleaseType = id => {
    switch (id) {
      case 1:
        return (
          <span
            css={`
              color: ${props => props.theme.palette.colors.green};
            `}
          >
            [Stable]
          </span>
        );
      case 2:
        return (
          <span
            css={`
              color: ${props => props.theme.palette.colors.yellow};
            `}
          >
            [Beta]
          </span>
        );
      case 3:
      default:
        return (
          <span
            css={`
              color: ${props => props.theme.palette.colors.red};
            `}
          >
            [Alpha]
          </span>
        );
    }
  };

  const primaryImage = modpack.attachments.find(v => v.isDefault);
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
          <Parallax bg={primaryImage.thumbnailUrl}>
            <ParallaxContent>{modpack.name}</ParallaxContent>
          </Parallax>
          <Content>{ReactHtmlParser(description)}</Content>
        </Container>
        <Footer>
          <div
            css={`
              flex: 1;
              display: flex;
              justify-content: center;
            `}
          >
            <StyledSelect
              placeholder={loading ? 'Loading Versions' : 'Select a version'}
              onChange={handleChange}
              listItemHeight={50}
              listHeight={400}
              loading={loading}
              disabled={loading}
            >
              {(files || []).map(file => (
                <Select.Option
                  title={file.displayName}
                  key={file.id}
                  value={file.id}
                >
                  <div
                    css={`
                      display: flex;
                      height: 50px;
                    `}
                  >
                    <div
                      css={`
                        flex: 7;
                        display: flex;
                        align-items: center;
                      `}
                    >
                      {file.displayName}
                    </div>
                    <div
                      css={`
                        flex: 2;
                        display: flex;
                        align-items: center;
                        flex-direction: column;
                      `}
                    >
                      <div>{file.gameVersion[0]}</div>
                      <div>{getReleaseType(file.releaseType)}</div>
                    </div>
                    <div
                      css={`
                        flex: 2;
                        display: flex;
                        align-items: center;
                      `}
                    >
                      <div>
                        {new Date(file.fileDate).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </Select.Option>
              ))}
            </StyledSelect>
          </div>
          <Button
            type="primary"
            disabled={!selectedId}
            onClick={() => {
              const modpackFile = files.find(file => file.id === selectedId);
              dispatch(closeModal());
              setVersion([FORGE, modpack.id, modpackFile.id]);
              setModpack(modpack);
              setStep(1);
            }}
          >
            Download
          </Button>
        </Footer>
      </>
    </Modal>
  );
};

export default React.memo(AddInstance);

const StyledSelect = styled(Select)`
  width: 650px;
  height: 50px;
  .ant-select-selection-placeholder {
    height: 50px !important;
    line-height: 50px !important;
  }
  .ant-select-selector {
    height: 50px !important;
    cursor: pointer !important;
  }
  .ant-select-selection-item {
    flex: 1;
    cursor: pointer;
    & > div {
      & > div:nth-child(2) {
        & > div:last-child {
          height: 10px;
          line-height: 5px;
        }
      }
    }
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
  padding-top: 20%;
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
