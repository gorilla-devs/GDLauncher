import React, { useState, useEffect, memo } from 'react';
import styled from 'styled-components';
import { Select, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import ReactHtmlParser from 'react-html-parser';
import path from 'path';
import {
  getAddonFiles,
  getAddonFileChangelog,
  getFTBModpackData,
  getFTBChangelog,
  getFTBModpackVersionData
} from '../../api';
import { changeModpackVersion } from '../../reducers/actions';
import { closeModal } from '../../reducers/modals/actions';
import { _getInstancesPath, _getTempPath } from '../../utils/selectors';
import { makeInstanceRestorePoint } from '../../utils';

const Modpack = ({ modpackId, instanceName, manifest, fileID }) => {
  const [files, setFiles] = useState([]);
  const [versionName, setVersionName] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [installing, setInstalling] = useState(false);
  const dispatch = useDispatch();
  const tempPath = useSelector(_getTempPath);
  const instancesPath = useSelector(_getInstancesPath);

  const convertFtbReleaseType = type => {
    switch (type) {
      case 'Release':
        return 1;
      case 'Beta':
        return 2;
      default:
        return 3;
    }
  };

  const initData = async () => {
    setLoading(true);
    if (manifest) {
      setVersionName(`${manifest?.name} - ${manifest?.version}`);
      const data = await getAddonFiles(modpackId);
      const mappedFiles = await Promise.all(
        data.map(async v => {
          const changelog = await getAddonFileChangelog(modpackId, v.id);
          return {
            ...v,
            changelog
          };
        })
      );
      setFiles(mappedFiles);
    } else {
      const ftbModpack = await getFTBModpackData(modpackId);

      setVersionName(
        `${ftbModpack.name} - ${
          ftbModpack.versions.find(modpack => modpack.id === fileID).name
        }`
      );

      const mappedVersions = await Promise.all(
        ftbModpack.versions.map(async version => {
          const changelog = await getFTBChangelog(modpackId, version.id);
          const newModpack = await getFTBModpackVersionData(
            modpackId,
            version.id
          );

          return {
            displayName: `${ftbModpack.name} ${version.name}`,
            id: version.id,
            gameVersions: [newModpack.targets[1]?.version],
            releaseType: convertFtbReleaseType(version.type),
            fileDate: version.updated * 1000,
            imageUrl: ftbModpack.art[0].url,
            changelog: changelog.content
          };
        })
      );

      setFiles(mappedVersions);
    }
    setLoading(false);
  };

  useEffect(() => {
    initData().catch(console.error);
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
  const newInstancePath = path.join(tempPath, `${instanceName}__RESTORE`);

  return (
    <Container>
      Installed version: {versionName}
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
          virtual={false}
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
                  <div>{file.gameVersions[0]}</div>
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
          await makeInstanceRestorePoint(
            newInstancePath,
            instancesPath,
            instanceName
          );
          await dispatch(
            changeModpackVersion(instanceName, files[selectedIndex])
          );
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
