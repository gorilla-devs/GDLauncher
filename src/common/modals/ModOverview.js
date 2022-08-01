/* eslint-disable */
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import ReactHtmlParser from 'react-html-parser';
import ReactMarkdown from 'react-markdown';
import path from 'path';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt, faInfo } from '@fortawesome/free-solid-svg-icons';
import { Button, Select } from 'antd';
import Modal from '../components/Modal';
import { transparentize } from 'polished';
import {
  getAddonDescription,
  getAddonFiles,
  getAddon,
  getModrinthProject,
  getModrinthVersions,
  getModrinthUser,
  getModrinthVersion
} from '../api';
import CloseButton from '../components/CloseButton';
import { closeModal, openModal } from '../reducers/modals/actions';
import {
  installMod,
  installModrinthMod,
  updateInstanceConfig
} from '../reducers/actions';
import { remove } from 'fs-extra';
import { _getInstancesPath, _getInstance } from '../utils/selectors';
import {
  FABRIC,
  FORGE,
  CURSEFORGE_URL,
  CURSEFORGE,
  MODRINTH
} from '../utils/constants';
import { formatNumber, formatDate } from '../utils';
import {
  filterFabricFilesByVersion,
  filterForgeFilesByVersion,
  getPatchedInstanceType
} from '../../app/desktop/utils';

const ModOverview = ({
  source,
  projectID,
  fileID,
  gameVersions,
  instanceName,
  fileName
}) => {
  const dispatch = useDispatch();
  const [description, setDescription] = useState(null);
  // curseforge only
  const [addon, setAddon] = useState(null);
  // modrinth only
  const [mod, setMod] = useState(null);
  const [author, setAuthor] = useState('');
  const [downloadCount, setDownloadCount] = useState(0);
  const [updatedDate, setUpdatedDate] = useState(0);
  const [gameVersion, setGameVersion] = useState('');
  const [url, setUrl] = useState('');
  const [files, setFiles] = useState([]);
  const [selectedItem, setSelectedItem] = useState(fileID);
  const [installedData, setInstalledData] = useState({ fileID, fileName });
  const [loading, setLoading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const instancesPath = useSelector(_getInstancesPath);
  const instance = useSelector(state => _getInstance(state)(instanceName));

  useEffect(() => {
    const init = async () => {
      setLoadingFiles(true);

      if (source === CURSEFORGE) {
        await Promise.all([
          getAddon(projectID).then(addon => {
            setAddon(addon);
            setAuthor(addon.author || addon.authors?.at(0).name);
            setDownloadCount(addon.downloadCount);
            setUpdatedDate(Date.parse(addon.dateModified));
            setGameVersion(addon.latestFilesIndexes[0].gameVersion);
            setUrl(addon.links?.websiteUrl);
          }),
          getAddonDescription(projectID).then(data => {
            // Replace the beginning of all relative URLs with the Curseforge URL
            const modifiedData = data.replace(
              /href="(?!http)/g,
              `href="${CURSEFORGE_URL}`
            );
            setDescription(modifiedData);
          }),
          getAddonFiles(projectID).then(async data => {
            const isFabric =
              getPatchedInstanceType(instance) === FABRIC &&
              projectID !== 361988;
            const isForge =
              getPatchedInstanceType(instance) === FORGE ||
              projectID === 361988;
            let filteredFiles = [];
            if (isFabric) {
              filteredFiles = filterFabricFilesByVersion(data, gameVersions);
            } else if (isForge) {
              filteredFiles = filterForgeFilesByVersion(data, gameVersions);
            }

            setFiles(filteredFiles);
            setLoadingFiles(false);
          })
        ]);
      } else if (source === MODRINTH) {
        const project = await getModrinthProject(projectID);
        setMod(project);

        setDescription(project.body);
        const versions = (await getModrinthVersions(project.versions)).sort(
          (a, b) => Date.parse(b.date_published) - Date.parse(a.date_published)
        );
        setFiles(versions);
        setLoadingFiles(false);
        getModrinthUser(versions[0].author_id).then(user => {
          setAuthor(user?.username || '');
        });
        setDownloadCount(project.downloads);
        setUpdatedDate(Date.parse(project.updated));
        setGameVersion(versions[0].game_versions[0]);
        setUrl(`https://modrinth.com/mod/${project.slug}`);
      }
    };

    init();
  }, []);

  const getPlaceholderText = () => {
    if (loadingFiles) {
      return 'Loading files';
    } else if (files.length === 0 && !loadingFiles) {
      return 'Mod not available';
    } else {
      return 'Select a version';
    }
  };

  const getReleaseType = id => {
    if (typeof id === 'string') id = id.toUpperCase();

    switch (id) {
      case 1:
      case 'RELEASE':
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
      case 'BETA':
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
      case 'ALPHA':
        return (
          <span
            css={`
              color: ${props => props.theme.palette.colors.red};
            `}
          >
            [Alpha]
          </span>
        );
      default:
        return (
          <span
            css={`
              color: ${props => props.theme.palette.colors.red};
            `}
          >
            [Unknown]
          </span>
        );
    }
  };

  const handleChange = value => {
    if (source === CURSEFORGE) {
      setSelectedItem(JSON.parse(value));
    } else if (source === MODRINTH) {
      setSelectedItem(value);
    }
  };

  const primaryImage = addon?.logo || mod?.icon_url;
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
          <Parallax bg={primaryImage}>
            <ParallaxContent>
              <ParallaxInnerContent>
                {addon?.name || mod?.name}
                <ParallaxContentInfos>
                  <div>
                    <label>Author: </label>
                    {author}
                  </div>
                  {downloadCount && (
                    <div>
                      <label>Downloads: </label>
                      {formatNumber(downloadCount)}
                    </div>
                  )}
                  <div>
                    <label>Last Update: </label> {formatDate(updatedDate)}
                  </div>
                  <div>
                    <label>MC version: </label>
                    {gameVersion}
                  </div>
                </ParallaxContentInfos>
                <Button
                  href={url}
                  css={`
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    justify-content: center;
                  `}
                  type="primary"
                >
                  <FontAwesomeIcon icon={faExternalLinkAlt} />
                </Button>
                <Button
                  disabled={loadingFiles}
                  onClick={() => {
                    dispatch(
                      openModal('ModChangelog', {
                        projectID,
                        projectName: addon?.name || mod?.name,
                        files,
                        type: source
                      })
                    );
                  }}
                  css={`
                    position: absolute;
                    top: 20px;
                    left: 60px;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    justify-content: center;
                  `}
                  type="primary"
                >
                  <FontAwesomeIcon icon={faInfo} />
                </Button>
              </ParallaxInnerContent>
            </ParallaxContent>
          </Parallax>
          <Content>
            {source === CURSEFORGE ? (
              ReactHtmlParser(description)
            ) : (
              <ReactMarkdown>{description}</ReactMarkdown>
            )}
          </Content>
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
                The installed version of this mod has been taken down, so you
                will only be able to get it as part of legacy modpacks.
              </div>
            )}
          <StyledSelect
            placeholder={getPlaceholderText()}
            loading={loadingFiles}
            disabled={loadingFiles}
            value={
              files.find(v => v.id === installedData.fileID) && selectedItem
            }
            onChange={handleChange}
            listItemHeight={50}
            listHeight={400}
            virtual={false}
          >
            {(files || []).map(file => (
              <Select.Option
                title={file.displayName || file.name}
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
                    {file.displayName || file.name}
                  </div>
                  <div
                    css={`
                      flex: 2;
                      display: flex;
                      align-items: center;
                      flex-direction: column;
                    `}
                  >
                    <div>
                      {source === CURSEFORGE
                        ? gameVersions
                        : file.game_versions[0]}
                    </div>
                    <div>
                      {getReleaseType(file.releaseType || file.version_type)}
                    </div>
                  </div>
                  <div
                    css={`
                      flex: 3;
                      display: flex;
                      align-items: center;
                    `}
                  >
                    <div>
                      {new Date(
                        file.fileDate || file.date_published
                      ).toLocaleDateString(undefined, {
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
          <Button
            type="primary"
            disabled={
              (!selectedItem || installedData.fileID === selectedItem) && addon
            }
            loading={loading}
            onClick={async () => {
              setLoading(true);
              if (installedData.fileID) {
                dispatch(
                  updateInstanceConfig(instanceName, prev => ({
                    ...prev,
                    mods: prev.mods.filter(
                      v => v.fileName !== installedData.fileName
                    )
                  }))
                );
                await remove(
                  path.join(
                    instancesPath,
                    instanceName,
                    'mods',
                    installedData.fileName
                  )
                );
              }
              if (source === CURSEFORGE) {
                const newFile = dispatch(
                  installMod(
                    projectID,
                    selectedItem,
                    instanceName,
                    gameVersions,
                    !installedData.fileID,
                    null,
                    null,
                    addon
                  )
                );
                setInstalledData({ fileID: selectedItem, fileName: newFile });
              } else if (source === MODRINTH) {
                const version = await getModrinthVersion(selectedItem);
                const newFile = dispatch(
                  installModrinthMod(version, instanceName, gameVersion)
                );
                setInstalledData({ fileID: selectedItem, fileName: newFile });
              }

              setLoading(false);
            }}
          >
            {installedData.fileID ? 'Switch Version' : 'Download'}
          </Button>
        </Footer>
      </>
    </Modal>
  );
};

export default React.memo(ModOverview);

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
  width: 100%;
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

const ParallaxInnerContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  a {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    width: 30px;
    height: 30px;
  }
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

const ParallaxContentInfos = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: normal;
  font-size: 12px;
  position: absolute;
  bottom: 40px;
  div {
    margin: 0 5px;
    label {
      font-weight: bold;
    }
  }
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
