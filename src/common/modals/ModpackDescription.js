/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import ReactHtmlParser from 'react-html-parser';
import ReactMarkdown from 'react-markdown';
import { shell } from 'electron';
import { faExternalLinkAlt, faInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Checkbox, TextField, Cascader, Button, Input, Select } from 'antd';
import Modal from '../components/Modal';
import { transparentize } from 'polished';
import {
  getAddonDescription,
  getAddonFiles,
  getModrinthVersions,
  getModrinthUser
} from '../api';
import CloseButton from '../components/CloseButton';
import { closeModal, openModal } from '../reducers/modals/actions';
import {
  FORGE,
  CURSEFORGE_URL,
  FTB_MODPACK_URL,
  MODRINTH,
  CURSEFORGE,
  FTB
} from '../utils/constants';
import { formatNumber, formatDate } from '../utils';

const ModpackDescription = ({
  modpack,
  setStep,
  setModpack,
  setVersion,
  type
}) => {
  const dispatch = useDispatch();
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState(null);
  const [selectedId, setSelectedId] = useState(false);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState('');
  const [downloadCount, setDownloadCount] = useState(0);
  const [updatedDate, setUpdatedDate] = useState(0);
  const [gameVersion, setGameVersion] = useState('');
  const [url, setUrl] = useState('');

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      switch (type) {
        case CURSEFORGE: {
          await Promise.all([
            getAddonDescription(modpack.id).then(data => {
              // Replace the beginning of all relative URLs with the Curseforge URL
              const modifiedData = data.replace(
                /href="(?!http)/g,
                `href="${CURSEFORGE_URL}`
              );

              setDescription(modifiedData);
            }),
            getAddonFiles(modpack.id).then(data => {
              setFiles(data);
              setAuthor(modpack.author || modpack.authors?.at(0).name);
              setDownloadCount(modpack.downloadCount);
              setUpdatedDate(Date.parse(modpack.dateModified));
              setGameVersion(modpack.latestFilesIndexes[0].gameVersion);
              setUrl(modpack.websiteUrl);
            })
          ]);

          setLoading(false);
          break;
        }
        case FTB: {
          setDescription(modpack.description);
          setFiles(modpack.versions.slice().reverse());
          setAuthor(modpack.author || modpack.authors?.at(0).name);
          setDownloadCount(modpack.installs);
          setUpdatedDate(modpack.refreshed * 1000);
          setGameVersion(modpack.tags[0]?.name || '-');
          setUrl(parseLink(modpack.name));

          setLoading(false);
          break;
        }
        case MODRINTH: {
          setDescription(modpack.body);
          const versions = (
            await getModrinthVersions(modpack.versions)
          ).sort(
            (a, b) =>
              Date.parse(b.date_published) - Date.parse(a.date_published)
          );
          setFiles(versions);
          getModrinthUser(versions[0].author_id).then(user => {
            setAuthor(user?.username || '');
          });
          setDownloadCount(modpack.downloads);
          setUpdatedDate(Date.parse(modpack.updated));
          setGameVersion(versions[0].game_versions[0]);
          setUrl(`https://modrinth.com/modpack/${modpack.slug}`);

          setLoading(false);
          break;
        }
      }
    };
    init();
  }, []);

  const handleChange = value => setSelectedId(value);

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

  const parseLink = string => {
    const newName = string
      .replace(/\+/, 'plus')
      .replace(/-+/, 'minus')
      .replace(/[^0-9a-z]/gi, '_')
      .replace(/_+/, '_');
    return `${FTB_MODPACK_URL}/${newName}`;
  };

  const primaryImage = useMemo(() => {
    if (type === 'curseforge') {
      return modpack.logo.thumbnailUrl;
    } else if (type === 'ftb') {
      const image = modpack.art.reduce((prev, curr) => {
        if (!prev || curr.size < prev.size) return curr;
        return prev;
      });
      return image.url;
    } else if (type === MODRINTH) {
      return (
        modpack.gallery?.find(img => img.featured)?.url ||
        modpack.gallery?.at(0)?.url ||
        modpack.icon_url ||
        ''
      );
    }
  }, [modpack, type]);

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
                {modpack.name}
                <ParallaxContentInfos>
                  <div>
                    <label>Author: </label>
                    {author}
                  </div>
                  <div>
                    <label>Downloads: </label>
                    {downloadCount}
                  </div>
                  <div>
                    <label>Last Update: </label>
                    {formatDate(updatedDate)}
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
                  disabled={loading}
                  onClick={() => {
                    dispatch(
                      openModal('ModChangelog', {
                        projectID: modpack.id,
                        projectName: modpack.name,
                        files,
                        type
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
            {type === CURSEFORGE ? (
              ReactHtmlParser(description)
            ) : (
              <ReactMarkdown>{description}</ReactMarkdown>
            )}
          </Content>
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
              virtual={false}
            >
              {(files || []).map(file => (
                <Select.Option
                  title={
                    type === 'ftb'
                      ? `${modpack.name} - ${file.name}`
                      : file.displayName
                  }
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
                      {type === CURSEFORGE
                        ? file.displayName
                        : `${modpack.name} - ${file.name}`}
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
                        {type === 'ftb'
                          ? modpack.tags[0]?.name || '-'
                          : type === CURSEFORGE
                          ? file.gameVersions[0]
                          : file.game_versions.sort().at(-1)}
                      </div>
                      <div>
                        {getReleaseType(
                          type === 'ftb'
                            ? file.type
                            : type === CURSEFORGE
                            ? file.releaseType
                            : file.version_type
                        )}
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
                          type === 'ftb'
                            ? file.updated * 1000
                            : type === CURSEFORGE
                            ? file.fileDate
                            : file.date_published
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
          </div>
          <Button
            type="primary"
            disabled={!selectedId}
            onClick={() => {
              const modpackFile = files.find(file => file.id === selectedId);
              setVersion({
                loaderType: FORGE,
                projectID: modpack.id,
                fileID: modpackFile.id,
                source: type
              });
              setModpack(modpack);
              setStep(1);
              dispatch(closeModal());
            }}
          >
            Download
          </Button>
        </Footer>
      </>
    </Modal>
  );
};

export default React.memo(ModpackDescription);

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
