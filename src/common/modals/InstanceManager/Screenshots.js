/* eslint-disable */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { promises as fs, watch, createReadStream } from 'fs';
import fse from 'fs-extra';
import path from 'path';
import base64 from 'base64-stream';
import getStream from 'get-stream';
import styled from 'styled-components';
import makeDir from 'make-dir';
import { Checkbox } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import groupBy from 'lodash/groupBy';
import isEqual from 'lodash/isEqual';
import sortBy from 'lodash/sortBy';
import {
  ContextMenuTrigger,
  ContextMenu,
  MenuItem,
  hideMenu
} from 'react-contextmenu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faCopy,
  faLink,
  faFolder,
  faImage
} from '@fortawesome/free-solid-svg-icons';
import { _getInstancesPath } from '../../utils/selectors';
import { openModal } from '../../reducers/modals/actions';
import { imgurPost } from '../../api';
import sendMessage from '../../utils/sendMessage';
import EV from '../../messageEvents';

const getScreenshots = async screenshotsPath => {
  const files = await fs.readdir(screenshotsPath);
  const screenshots = [];
  try {
    await Promise.all(
      files.map(async element => {
        const stats = await fs.stat(path.join(screenshotsPath, element));
        const fileBirthdate = new Date(stats.birthtimeMs);
        const timeDiff = Date.now() - fileBirthdate;
        const days = parseInt(Math.floor(timeDiff / 1000) / 60 / 60 / 24, 10);
        screenshots.push({
          name: element,
          days,
          timestamp: fileBirthdate,
          size: stats.size
        });
      })
    );
    return screenshots.sort((a, b) => a.timestamp - b.timestamp);
  } catch (e) {
    console.error(e);
  }
};

const getImgurLink = async (imagePath, fileSize, setProgressUpdate) => {
  const updateProgress = progressEvent => {
    setProgressUpdate(
      Math.round((progressEvent.loaded * 100) / progressEvent.total)
    );
  };

  const imageReadStream = createReadStream(imagePath);
  const encodedData = new base64.Base64Encode();
  const b64s = imageReadStream.pipe(encodedData);
  const base64String = await getStream(b64s);

  if (fileSize < 10485760) {
    const res = await imgurPost(base64String, updateProgress);

    if (res.status == 200) {
      sendMessage(EV.COPY_TEXT_TO_CLIPBOARD, res.data.data.link);
    }
  }
};

const openFolder = screenshotsPath => {
  sendMessage(EV.OPEN_FOLDER, screenshotsPath);
};

const getTitle = days => {
  const parsedDays = Number.parseInt(days, 10);
  if (parsedDays === 0) return 'Today';
  else if (parsedDays === 1) return 'Yesterday';
  else if (parsedDays > 1 && parsedDays < 30) return `${days} days ago`;
  else if (parsedDays >= 30 && parsedDays < 365)
    return `${Math.floor(days / 30)} months ago`;
  else if (parsedDays >= 365) return `${Math.floor(days / 365)} years ago`;
};

const getScreenshotsCount = groups =>
  Object.values(groups).reduce((prev, curr) => (prev += curr.length), 0);

const getScreenshotsList = groups =>
  Object.values(groups).reduce((prev, curr) => prev.concat(curr), []);

let watcher;

const Screenshots = ({ instanceName }) => {
  const instancesPath = useSelector(_getInstancesPath);
  const screenshotsPath = path.join(instancesPath, instanceName, 'screenshots');
  const [dateGroups, setDateGroups] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [progressUpdate, setProgressUpdate] = useState(null);
  const [uploadingFileName, setUploadingFileName] = useState(null);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const dispatch = useDispatch();

  const isImageCopied = progressUpdate => {
    if (
      progressUpdate === 100 &&
      uploadingFileName !== null &&
      selectedItems.includes(uploadingFileName)
    ) {
      return 'Image copied to clipboard!';
    } else if (
      uploadingFileName != null &&
      selectedItems[0] != uploadingFileName
    ) {
      return 'Busy! Wait before uploading another image';
    } else return 'Share the image via url';
  };

  const containerRef = useRef(null);

  const selectAll = useCallback(() => {
    if (
      isEqual(
        sortBy(getScreenshotsList(dateGroups).map(x => x.name)),
        sortBy(selectedItems)
      )
    ) {
      setSelectedItems([]);
    } else {
      setSelectedItems(getScreenshotsList(dateGroups).map(x => x.name));
    }
  }, [selectedItems, dateGroups, setSelectedItems]);

  const deleteFile = useCallback(
    async fileName => {
      if (selectedItems.length === 1) {
        await fse.remove(
          path.join(
            instancesPath,
            instanceName,
            'screenshots',
            selectedItems[0]
          )
        );
      } else if (selectedItems.length > 1) {
        await Promise.all(
          selectedItems.map(async screenShot => {
            await fse.remove(
              path.join(instancesPath, instanceName, 'screenshots', screenShot)
            );
          })
        );
      }
    },
    [selectedItems, instancesPath, instanceName]
  );

  const startListener = async () => {
    await makeDir(screenshotsPath);
    const screenshots = await getScreenshots(screenshotsPath);
    setDateGroups(groupBy(screenshots, 'days'));
    watcher = watch(screenshotsPath, async (event, filename) => {
      if (filename) {
        const sortedScreens = await getScreenshots(screenshotsPath);
        setDateGroups(groupBy(sortedScreens, 'days'));
      }
    });
  };

  useEffect(() => {
    startListener();

    return () => watcher?.close();
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      const eventHandler = e => {
        if (contextMenuOpen) {
          e.preventDefault();
          containerRef.current.scrollTop = 0;
        }
      };
      containerRef.current.addEventListener('wheel', eventHandler);
      return () =>
        containerRef.current.removeEventListener('wheel', eventHandler);
    }
  }, [containerRef.current, contextMenuOpen]);

  return (
    <ExternalContainer ref={containerRef}>
      <Bar>
        <GlobalCheckbox
          onChange={selectAll}
          indeterminate={
            selectedItems.length > 0 &&
            selectedItems.length < getScreenshotsCount(dateGroups)
          }
          checked={
            getScreenshotsCount(dateGroups) > 0 &&
            getScreenshotsCount(dateGroups) === selectedItems.length
          }
        >
          {`${selectedItems.length} selected`}
        </GlobalCheckbox>

        <DeleteButton
          onClick={() => {
            if (selectedItems.length) {
              dispatch(
                openModal('ActionConfirmation', {
                  message: 'Are you sure you want to delete this images?',
                  confirmCallback: deleteFile,
                  title: 'Confirm'
                })
              );
            }
          }}
          selectedItems={selectedItems}
          icon={faTrash}
        />
        <OpenFolderButton
          onClick={() => openFolder(screenshotsPath)}
          icon={faFolder}
        />
      </Bar>
      <Container groupsCount={Object.entries(dateGroups).length}>
        {Object.entries(dateGroups).length > 0 ? (
          Object.entries(dateGroups).map(([key, group]) => {
            return (
              <DataSectionContainer key={key}>
                <TitleDataSection>{getTitle(key.toString())}</TitleDataSection>
                <DateSection groupsCount={Object.entries(dateGroups).length}>
                  {group.map(file => (
                    <span key={file.name}>
                      <ContextMenuTrigger id={file.name}>
                        <PhotoContainer
                          selectedItems={selectedItems}
                          name={file.name}
                        >
                          <SelectCheckBoxContainer>
                            <SelectCheckBox
                              onClick={() => {
                                setSelectedItems(
                                  selectedItems.indexOf(file.name) > -1
                                    ? selectedItems.filter(x => x != file.name)
                                    : selectedItems.concat([file.name])
                                );
                              }}
                              checked={selectedItems.indexOf(file.name) > -1}
                              selected={selectedItems.indexOf(file.name) > -1}
                            />
                          </SelectCheckBoxContainer>
                          <Photo
                            onClick={() =>
                              dispatch(
                                openModal('Screenshot', {
                                  screenshotsPath,
                                  file
                                })
                              )
                            }
                            selected={selectedItems.indexOf(file.name) > -1}
                            src={`file:///${path.join(
                              screenshotsPath,
                              file.name
                            )}`}
                          />
                        </PhotoContainer>
                      </ContextMenuTrigger>
                      <StyledContexMenu
                        id={file.name}
                        onShow={() => {
                          setContextMenuOpen(true);
                          if (
                            selectedItems.length === 0 ||
                            !selectedItems.includes(file.name)
                          ) {
                            setSelectedItems([file.name]);
                          } else if (
                            selectedItems.length === 1 &&
                            !selectedItems.includes(file.name)
                          ) {
                            setSelectedItems([...selectedItems, file.name]);
                          }
                        }}
                        onHide={() => {
                          setContextMenuOpen(false);
                          if (!selectedItems.includes(file.name)) {
                            setSelectedItems([file.name]);
                          }
                        }}
                      >
                        {selectedItems.length > 1 &&
                        selectedItems.length <
                          getScreenshotsCount(dateGroups) ? (
                          <MenuItem
                            onClick={() => {
                              dispatch(
                                openModal('ActionConfirmation', {
                                  message:
                                    'Are you sure you want to delete this image?',
                                  fileName: file.name,
                                  confirmCallback: deleteFile,
                                  title: 'Confirm'
                                })
                              );
                            }}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                            {`Delete ${selectedItems.length} items`}
                          </MenuItem>
                        ) : (
                          selectedItems.length ===
                            getScreenshotsCount(dateGroups) &&
                          getScreenshotsCount(dateGroups) > 1 && (
                            <MenuItem
                              onClick={() => {
                                dispatch(
                                  openModal('ActionConfirmation', {
                                    message:
                                      'Are you sure you want to delete this image?',
                                    fileName: file.name,
                                    confirmCallback: deleteFile,
                                    title: 'Confirm'
                                  })
                                );
                              }}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                              Delete all
                            </MenuItem>
                          )
                        )}

                        {selectedItems.length < 2 && (
                          <>
                            <MenuItem
                              onClick={() =>
                                dispatch(
                                  openModal('Screenshot', {
                                    screenshotsPath,
                                    file
                                  })
                                )
                              }
                            >
                              <FontAwesomeIcon icon={faImage} />
                              Preview
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                sendMessage(
                                  EV.COPY_IMAGE_TO_CLIPBOARD,
                                  path.join(screenshotsPath, file.name)
                                );
                              }}
                            >
                              <FontAwesomeIcon icon={faCopy} />
                              Copy the image
                            </MenuItem>
                            <ImgurShareMenuItem
                              disabled={
                                uploadingFileName != null &&
                                selectedItems.includes(uploadingFileName)
                              }
                              preventClose
                              onClick={async () => {
                                if (file.size < 10485760) {
                                  setUploadingFileName(file.name);
                                  try {
                                    await getImgurLink(
                                      path.join(screenshotsPath, file.name),
                                      file.size,
                                      setProgressUpdate
                                    );
                                  } finally {
                                    setUploadingFileName(null);
                                  }
                                }
                                setTimeout(() => {
                                  hideMenu();
                                }, 1000);
                              }}
                            >
                              <MenuShareLink>
                                <FontAwesomeIcon icon={faLink} />
                                {file.size < 10485760
                                  ? isImageCopied(
                                      progressUpdate,
                                      uploadingFileName,
                                      selectedItems
                                    )
                                  : `Image too big... ${Math.floor(
                                      file.size / 1024 / 1024
                                    )}MB`}
                              </MenuShareLink>
                              <LoadingSlider
                                selectedItems={selectedItems}
                                uploadingFileName={uploadingFileName}
                                translateAmount={
                                  uploadingFileName != null &&
                                  selectedItems.includes(uploadingFileName)
                                    ? -(100 - progressUpdate)
                                    : -100
                                }
                              />
                            </ImgurShareMenuItem>
                            <MenuItem
                              onClick={() => {
                                dispatch(
                                  openModal('ActionConfirmation', {
                                    message:
                                      'Are you sure you want to delete this image?',
                                    fileName: file.name,
                                    confirmCallback: deleteFile,
                                    title: 'Confirm'
                                  })
                                );
                              }}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                              Delete
                            </MenuItem>
                          </>
                        )}
                      </StyledContexMenu>
                    </span>
                  ))}
                </DateSection>
              </DataSectionContainer>
            );
          })
        ) : (
          <NoScreenAvailable>No Screenshot Available</NoScreenAvailable>
        )}
      </Container>
    </ExternalContainer>
  );
};

export default Screenshots;

const ExternalContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
  background: ${props => props.theme.palette.secondary.main};
  overflow-y: auto;
  overflow-x: hidden;
  height: ${props => (props.groupsCount !== 0 ? 'auto' : '100%')};
`;

const Bar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  min-height: 40px;
  max-height: 40px;
  width: 100%;
  background: ${props => props.theme.palette.secondary.main};
`;

const GlobalCheckbox = styled(Checkbox)`
  margin: 7px;
`;

const DateSection = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap-reverse;
  padding: 50px 10px 20px 10px;
  background: ${props => props.theme.palette.secondary.dark};
  margin: 10px 0 0 0;
`;

const NoScreenAvailable = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledContexMenu = styled(ContextMenu)`
  svg {
    margin: 0 7px 0 0;
  }
`;

const DeleteButton = styled(({ selectedItems, ...props }) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <FontAwesomeIcon {...props} />
))`
  margin: 0 10px;
  transition: color 0.3s ease-in-out;
  &:hover {
    path {
      color: ${props =>
        props.selectedItems.length > 0 ? props.theme.palette.colors.red : ''};
    }
  }
  cursor: ${props => (props.selectedItems.length > 0 ? 'pointer' : '')};
`;

const OpenFolderButton = styled(FontAwesomeIcon)`
  transition: color 0.1s ease-in-out;
  cursor: pointer;
  margin: 0 10px;
  &:hover {
    cursor: pointer;
    path {
      cursor: pointer;
      transition: color 0.1s ease-in-out;
      color: ${props => props.theme.palette.primary.main};
    }
  }
`;

const DataSectionContainer = styled.span`
  &:first-child {
    margin-top: -45px;
  }
`;

const TitleDataSection = styled.h2`
  position: relative;
  top: 50px;
  left: 20px;
`;

const LoadingSlider = styled.div`
  position: absolute;
  bottom: 4px;
  z-index: -1;
  width: 100%;
  height: 100%;
  transform: ${props =>
    props.uploadingFileName != null
      ? `translate(${props.translateAmount}%)`
      : 'translate(-100%)'};
  transition: transform 0.1s ease-in-out;
  background: ${props => props.theme.palette.primary.main};
`;

const Photo = styled.img`
  height: 100px;
  max-height: 100px;
  width: 100px;
  max-width: 200px;
  margin: 10px;
  background: ${props => props.theme.palette.secondary.light};
  border-radius: 5px;
  transition: transform 0.2s ease-in-out;
  filter: brightness(80%);
  border: ${props =>
    props.selected ? `solid 2px ${props.theme.palette.colors.blue}` : ''};
`;

const SelectCheckBoxContainer = styled.div`
  height: 10px;
  width: 10px;
  position: absolute;
  top: 0px;
  left: 0px;
`;

const SelectCheckBox = styled(Checkbox)`
  opacity: 0;
  position: absolute;
  top: 10px;
  left: 15px;
  z-index: 2;
  opacity: ${props => (props.selected ? 1 : 0)};
`;

const ImgurShareMenuItem = styled(MenuItem)`
  overflow: hidden;
  position: relative;
  padding: 0 !important;
`;

const MenuShareLink = styled.div`
  padding: 4px 10px;
  position: relative;
  svg {
    margin: 0 7px 0 0;
  }
`;
const PhotoContainer = styled.div`
  position: relative;
  height: 100px;
  max-height: 100px;
  width: 100px;
  max-width: 200px;
  margin: 10px;
  background: transparent;
  border-radius: 5px;
  transition: transform 0.2s ease-in-out;
  filter: brightness(80%);
  transform: ${props =>
    props.selectedItems.indexOf(props.name) > -1 ? 'scale(1.1)' : 'scale(1)'};
  &:hover {
    transform: scale(1.1);
    ${SelectCheckBox} {
      opacity: 1;
    }
  }
`;
