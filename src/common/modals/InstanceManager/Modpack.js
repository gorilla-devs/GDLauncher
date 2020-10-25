import React, { useState, useEffect, memo } from 'react';
import styled from 'styled-components';
import { Select, Button } from 'antd';
import { useDispatch } from 'react-redux';
import ReactHtmlParser from 'react-html-parser';
import { getAddonFiles, getAddonFileChangelog } from '../../api';
import { closeModal } from '../../reducers/modals/actions';
import { sortByDate } from '../../utils';
import sendMessage from '../../utils/sendMessage';
import EV from '../../messageEvents';

const Modpack = ({ modpackId, instanceName, manifest }) => {
  const [files, setFiles] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [installing, setInstalling] = useState(false);
  const dispatch = useDispatch();

  const initData = async () => {
    setLoading(true);
    const data = await getAddonFiles(modpackId);
    const sortedFiles = data.data.sort(sortByDate);
    const mappedFiles = await Promise.all(
      sortedFiles.map(async v => {
        const { data: changelog } = await getAddonFileChangelog(
          modpackId,
          v.id
        );
        return {
          ...v,
          changelog
        };
      })
    );
    setFiles(mappedFiles);
    setLoading(false);
  };

  useEffect(() => {
    initData();
  }, []);

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

  const handleChange = value => setSelectedIndex(value);

  return (
    <Container>
      Installed version: {manifest?.name} - {manifest?.version}
      <div
        css={`
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
          {(files || []).map((file, index) => (
            <Select.Option title={file.displayName} key={file.id} value={index}>
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
                    flex: 3;
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
      <Changelog>
        <div>{files[selectedIndex]?.displayName}</div>
        {files[selectedIndex]?.changelog &&
          ReactHtmlParser(files[selectedIndex]?.changelog)}
      </Changelog>
      <Button
        loading={installing}
        type="primary"
        disabled={selectedIndex === null}
        onClick={async () => {
          setInstalling(true);
          await sendMessage(EV.UPDATE_MODPACK_VERSION, [
            instanceName,
            files[selectedIndex]
          ]);
          setInstalling(false);
          dispatch(closeModal());
        }}
      >
        Switch Version
      </Button>
    </Container>
  );
};

export default memo(Modpack);

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledSelect = styled(Select)`
  width: 650px;
  height: 50px;
  margin-top: 20px;
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

const Changelog = styled.div`
  perspective: 1px;
  transform-style: preserve-3d;
  height: calc(100% - 160px);
  background: ${props => props.theme.palette.grey[900]};
  width: calc(100% - 80px);
  word-break: break-all;
  overflow-x: hidden;
  overflow-y: scroll;
  margin: 20px 40px;
  padding: 20px;
  font-size: 20px;
  * {
    color: ${props => props.theme.palette.text.primary} !important;
  }
  & > div:first-child {
    font-size: 24px;
    width: 100%;
    text-align: center;
    margin-bottom: 30px;
  }
  p {
    text-align: center;
  }
  img {
    max-width: 100%;
    height: auto;
  }
`;
