/* eslint-disable */
import React, { useEffect, useState, useCallback, useRef } from "react";
import { promises as fs, watch } from "fs";
import { clipboard } from "electron";
import fse from "fs-extra";
import path from "path";
import styled from "styled-components";
import makeDir from "make-dir";
import { Checkbox } from "antd";
import { useSelector, useDispatch } from "react-redux";
import _ from "lodash";
import {
  ContextMenuTrigger,
  ContextMenu,
  MenuItem,
  hideMenu
} from "react-contextmenu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faCopy, faLink } from "@fortawesome/free-solid-svg-icons";
import { _getInstancesPath } from "../../utils/selectors";
import { openModal } from "../../reducers/modals/actions";
import { imgurPost } from "../../api";

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

  const image = await fs.readFile(imagePath);

  if (fileSize < 10485760) {
    const res = await imgurPost(image, updateProgress);

    if (res.status == 200) {
      clipboard.writeText(res.data.data.link);
    }
  }
};

const getTitle = days => {
  const parsedDays = Number.parseInt(days, 10);
  if (parsedDays === 0) return "Today";
  else if (parsedDays === 1) return "Yesterday";
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
  const screenshotsPath = path.join(instancesPath, instanceName, "screenshots");
  const [dateGroups, setDateGroups] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [progressUpdate, setProgressUpdate] = useState(null);
  const [uploadingFileName, setUploadingFileName] = useState(null);
  const [uploadCompleted, setUploadCompleted] = useState(false);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);

  const dispatch = useDispatch();

  const containerRef = useRef(null);

  const selectAll = useCallback(() => {
    if (
      _.isEqual(
        _.sortBy(getScreenshotsList(dateGroups).map(x => x.name)),
        _.sortBy(selectedItems)
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
          path.join(instancesPath, instanceName, "screenshots", fileName)
        );
      } else if (selectedItems.length > 1) {
        Promise.all(
          selectedItems.map(async screenShot => {
            await fse.remove(
              path.join(instancesPath, instanceName, "screenshots", screenShot)
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
    setDateGroups(_.groupBy(screenshots, "days"));
    watcher = watch(screenshotsPath, async (event, filename) => {
      if (filename) {
        const sortedScreens = await getScreenshots(screenshotsPath);
        setDateGroups(_.groupBy(sortedScreens, "days"));
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
      containerRef.current.addEventListener("wheel", eventHandler);
      return () =>
        containerRef.current.removeEventListener("wheel", eventHandler);
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
          checked={getScreenshotsCount(dateGroups) === selectedItems.length}
        />
        <div>{`${selectedItems.length} selected`}</div>

        <DeleteButton
          onClick={() => deleteFile()}
          selectedItems={selectedItems}
          icon={faTrash}
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
                                openModal("Screenshot", {
                                  screenshotsPath,
                                  file
                                })
                              )
                            }
                            selected={selectedItems.indexOf(file.name) > -1}
                            src={path.join(screenshotsPath, file.name)}
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
                          <DeleteAllButton
                            onClick={() => deleteFile(file.name)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                            {`Delete ${selectedItems.length} items`}
                          </DeleteAllButton>
                        ) : (
                          selectedItems.length ===
                            getScreenshotsCount(dateGroups) && (
                            <DeleteAllButton
                              onClick={() => deleteFile(file.name)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                              Delete all
                            </DeleteAllButton>
                          )
                        )}

                        {selectedItems.length < 2 && (
                          <>
                            <MenuItem onClick={() => deleteFile(file.name)}>
                              <FontAwesomeIcon icon={faTrash} />
                              Delete
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                clipboard.writeImage(
                                  path.join(screenshotsPath, file.name)
                                );
                              }}
                            >
                              <FontAwesomeIcon icon={faCopy} />
                              Copy the image
                            </MenuItem>
                            <ImgurShareMenuItem
                              preventClose
                              onClick={async () => {
                                if (file.size < 10485760) {
                                  setUploadCompleted(false);
                                  setUploadingFileName(file.name);
                                  try {
                                    await getImgurLink(
                                      path.join(screenshotsPath, file.name),
                                      file.size,
                                      setProgressUpdate
                                    );
                                  } finally {
                                    setUploadCompleted(true);
                                    setUploadingFileName(null);
                                  }
                                }
                                hideMenu();
                              }}
                            >
                              <MenuShareLink>
                                <FontAwesomeIcon icon={faLink} />

                                {file.size < 10485760
                                  ? "Share the image via url"
                                  : `Image too big... ${Math.floor(
                                      file.size / 1024 / 1024
                                    )}MB`}
                              </MenuShareLink>
                              <LoadingSlider
                                translateAmount={-(100 - progressUpdate)}
                              />
                            </ImgurShareMenuItem>
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
          <NoScreenAvailable>No ScreensShots Available</NoScreenAvailable>
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
  height: ${props => (props.groupsCount !== 0 ? "auto" : "100%")};
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
  text-align: center;
  padding-top: 25%;
`;

const StyledContexMenu = styled(ContextMenu)`
  svg {
    margin: 0 7px 0 0;
  }
`;

const DeleteButton = styled(FontAwesomeIcon)`
  margin-left: 20px;
  transition: color 0.3s ease-in-out;
  &:hover {
    path {
      color: ${props =>
        props.selectedItems.length > 0 ? props.theme.palette.colors.red : ""};
    }
  }
  cursor: ${props => (props.selectedItems.length > 0 ? "pointer" : "")};
`;

const DeleteAllButton = styled(MenuItem)`
  background: ${props => props.theme.palette.colors.red};

  &:hover {
    background: ${props => props.theme.palette.colors.red};
    filter: brightness(80%);
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
  transform: ${props => `translate(${props.translateAmount}%)`};
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
  height: 100px;
  border: ${props =>
    props.selected ? `solid 2px ${props.theme.palette.colors.blue}` : ""};
`;

const SelectCheckBoxContainer = styled.div`
  height: 10px;
  width; 10px;
  position: absolute;
  top: 0px;
  left: 0px;
`;

const SelectCheckBox = styled(Checkbox)`
  opacity: 0;
  position: absolute;
  top: 10px;
  left: 15px;
  z-index: 1000;
  opacity: ${props => (props.selected ? 1 : 0)};
`;

const ImgurShareMenuItem = styled(MenuItem)`
  overflow: hidden;
  position: relative;
  padding: 0 !important;
`;

const MenuShareLink = styled(MenuItem)`
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
    props.selectedItems.indexOf(props.name) > -1 ? "scale(1.1)" : "scale(1)"};
  height: 100px;
  &:hover {
    transform: scale(1.1);
    ${SelectCheckBox} {
      opacity: 1;
    }
  }
`;
