import React, { useState, useEffect, memo } from 'react';
import styled from 'styled-components';
import { Select } from 'antd';
import ReactHtmlParser from 'react-html-parser';
import { getAddonFiles, getAddonFileChangelog } from '../../api';

const Modpack = ({ modpackId }) => {
  const [files, setFiles] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(false);
  const [loading, setLoading] = useState(false);

  const initData = async () => {
    setLoading(true);
    const { data } = await getAddonFiles(modpackId);
    const mappedFiles = await Promise.all(
      data.map(async v => {
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
    console.log(mappedFiles);
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
    </Container>
  );
};

export default memo(Modpack);

const Container = styled.div`
  height: 100%;
`;

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

const Changelog = styled.div`
  perspective: 1px;
  transform-style: preserve-3d;
  height: calc(100% - 120px);
  background: ${props => props.theme.palette.grey[900]};
  width: calc(100% - 80px);
  word-break: break-all;
  overflow-x: hidden;
  overflow-y: scroll;
  margin: 40px;
  padding: 20px;
  font-size: 20px;
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
