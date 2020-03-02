/* eslint-disable */
import React, { useEffect, useState } from "react";
import { promises as fs, watch } from "fs";
import { clipboard } from "electron";
import fse from "fs-extra";
import path from "path";
import styled from "styled-components";
import makeDir from "make-dir";
import { Checkbox } from "antd";
import { useSelector, useDispatch } from "react-redux";
import _ from "lodash";
import axios from "axios";
import { ContextMenuTrigger, ContextMenu, MenuItem } from "react-contextmenu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faCopy, faLink } from "@fortawesome/free-solid-svg-icons";
import { _getInstancesPath } from "../../utils/selectors";
import { openModal } from "../../reducers/modals/actions";
import { CLIENT_ID } from "../../utils/constants";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
  background: ${props => props.theme.palette.secondary.main};
  overflow-y: auto;
  overflow-x: hidden;
  height: ${props => (props.screenNum ? "auto" : "100%")};
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

const DateSection = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap-reverse;
  padding: 50px 10px 20px 10px;
  background: ${props => props.theme.palette.secondary.dark};

  margin: ${props => (props.screenNum ? "10px 0 10px 0" : "10px 0 0px 0")};
`;

const DeleteButton = styled(FontAwesomeIcon)`
  margin-left: 20px;
  transition: color 0.3s ease-in-out;
  &:hover {
    path {
      color: ${props =>
        props.selectedScreens.length > 0 ? props.theme.palette.colors.red : ""};
    }
  }
  cursor: ${props => (props.selectedScreens.length > 0 ? "pointer" : "")};
`;

const DeleteAllButton = styled(MenuItem)`
  background: ${props => props.theme.palette.colors.red};

  &:hover {
    background: ${props => props.theme.palette.colors.red};
    filter: brightness(80%);
  }
`;

const TitleDataSection = styled.h2`
  position: relative;
  top: 50px;
  left: 20px;
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

const SelectCheckBox = styled(Checkbox)`
  opacity: 0;
  position: absolute;
  top: 10px;
  left: 15px;
  z-index: 1000;
  opacity: ${props => (props.selected ? 1 : 0)};
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
    props.isHovered &&
    props.selectedScreens.indexOf(props.name > -1) &&
    props.isHoveredName.includes(props.name)
      ? "scale(1.1)"
      : "scale(1)"};
  height: 100px;
  &:hover {
    transform: scale(1.1);
    ${SelectCheckBox} {
      opacity: 1;
    }
  }
`;

const deleteFile = async (
  InstancePath,
  instanceName,
  fileName,
  multipleOrNot,
  selectedScreens
) => {
  if (!multipleOrNot) {
    await fse.remove(
      path.join(InstancePath, instanceName, "screenshots", fileName)
    );
  } else {
    Promise.all(
      selectedScreens.map(async screenShot => {
        await fse.remove(
          path.join(InstancePath, instanceName, "screenshots", screenShot)
        );
      })
    );
  }
};

const calcDate = async ScreenShotsDir => {
  const screens = await fs.readdir(ScreenShotsDir);
  let sortedScreens = [];
  try {
    await Promise.all(
      screens.map(async element => {
        const screenTime = (await fs.stat(path.join(ScreenShotsDir, element)))
          .birthtimeMs;
        const date = new Date(screenTime);
        const timeDiff = Date.now() - date;
        const totalSeconds = parseInt(Math.floor(timeDiff / 1000), 10);
        const totalMinutes = parseInt(Math.floor(totalSeconds / 60), 10);
        const totalHours = parseInt(Math.floor(totalMinutes / 60), 10);
        const days = parseInt(Math.floor(totalHours / 24), 10);
        sortedScreens = sortedScreens.concat({
          name: element,
          days,
          timestamp: date
        });
        sortedScreens.sort((a, b) => {
          return a.timestamp - b.timestamp;
        });
      })
    );
    return sortedScreens;
  } catch (e) {
    console.log(e);
  }
};

const imgurShare = async image => {
  let screenShot = await fs.readFile(image);

  let b64Img = screenShot.toString("base64");

  var bodyFormData = new FormData();
  bodyFormData.append("image", b64Img);

  const res = await axios.post("https://api.imgur.com/3/image", bodyFormData, {
    headers: {
      Authorization: `Client-ID ${CLIENT_ID}`
    }
  });

  if (res.status == 200) {
    clipboard.writeText(res.data.data.link);
  }
};

const calcDateTitle = days => {
  const parsedDays = Number.parseInt(days, 10);
  if (parsedDays === 0) return "Today";
  else if (parsedDays === 1) return "Yesterday";
  else if (parsedDays > 1 && parsedDays < 30) return `${days} days ago`;
  else if (parsedDays >= 30 && parsedDays < 365)
    return `${Math.floor(days / 30)} months ago`;
  else if (parsedDays >= 365) return `${Math.floor(days / 365)} years ago`;
};

let watcher;

const startListener = (ScreenShotsDir, setGroupedStortedPhoto) => {
  watcher = watch(ScreenShotsDir, (event, filename) => {
    if (filename) {
      calcDate(ScreenShotsDir).then(sortedScreens => {
        setGroupedStortedPhoto(_.groupBy(sortedScreens, "days"));
      });
    }
  });
};

const selectAll = async (
  setSelectedScreens,
  ScreenShotsDir,
  selectedScreens
) => {
  const screens = await fs.readdir(ScreenShotsDir);

  if (
    screens
      .slice()
      .sort()
      .join(",") ===
    selectedScreens
      .slice()
      .sort()
      .join(",")
  ) {
    setSelectedScreens([]);
  } else setSelectedScreens(screens);
};

const ScreenShot = ({ instanceName }) => {
  const InstancePath = useSelector(_getInstancesPath);
  const ScreenShotsDir = path.join(InstancePath, instanceName, "screenshots");
  const [groupedSortedPhotos, setGroupedStortedPhoto] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [isHoveredName, setIsHoveredName] = useState([]);
  const [selectedScreens, setSelectedScreens] = useState([]);
  const [screensNum, setScreensNum] = useState(0);
  const dispatch = useDispatch();

  const createDir = async ScreenShotsDir => {
    await makeDir(ScreenShotsDir);
  };

  useEffect(() => {
    fs.readdir(ScreenShotsDir).then(x => setScreensNum(x.length));
    if (fse.pathExists(ScreenShotsDir)) {
      calcDate(ScreenShotsDir).then(sortedScreens => {
        setGroupedStortedPhoto(_.groupBy(sortedScreens, "days"));
        startListener(ScreenShotsDir, selectedScreens, setGroupedStortedPhoto);
      });
    } else {
      createDir();
      startListener(ScreenShotsDir, selectedScreens, setGroupedStortedPhoto);
    }
    return () => {
      if (watcher) {
        watcher.close();
      }
    };
  }, []);

  return (
    <div
      css={`
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
      `}
    >
      <Bar>
        <Checkbox
          onChange={() =>
            selectAll(setSelectedScreens, ScreenShotsDir, selectedScreens)
          }
          indeterminate={
            selectedScreens.length > 0 && selectedScreens.length < screensNum
          }
          checked={screensNum === selectedScreens.length}
          css={`
            margin: 7px;
          `}
        />

        <div>{`${selectedScreens.length} selected`}</div>

        <DeleteButton
          onClick={() =>
            deleteFile(
              InstancePath,
              instanceName,
              "",
              true,
              selectedScreens,
              setSelectedScreens
            )
          }
          selectedScreens={selectedScreens}
          icon={faTrash}
        />
      </Bar>
      <Container screenNum={Object.entries(groupedSortedPhotos).length > 0}>
        {Object.entries(groupedSortedPhotos).length > 0 ? (
          Object.entries(groupedSortedPhotos).map(([key, value]) => {
            return (
              <span
                key={key}
                css={`
                  &:first-child {
                    margin-top: -45px;
                  }
                `}
              >
                <TitleDataSection>
                  {calcDateTitle(key.toString())}
                </TitleDataSection>
                <DateSection
                  screenNum={Object.entries(groupedSortedPhotos).length > 0}
                >
                  {value.map(file => (
                    <span key={file.name}>
                      <ContextMenuTrigger id={file.name}>
                        <PhotoContainer
                          selectedScreens={selectedScreens}
                          isHovered={isHovered}
                          isHoveredName={isHoveredName}
                          name={file.name}
                        >
                          <div
                            css={`
                              height: 10px;
                              width; 10px;
                              position: absolute;
                              top: 0px;
                              left: 0px;
                              z-index: 1000;
                              background: red;
                            `}
                          >
                            <SelectCheckBox
                              onClick={() => {
                                selectedScreens.indexOf(file.name) > -1
                                  ? setSelectedScreens(
                                      selectedScreens.filter(
                                        x => x != file.name
                                      )
                                    )
                                  : setSelectedScreens([
                                      ...selectedScreens,
                                      file.name
                                    ]);
                              }}
                              selected={selectedScreens.indexOf(file.name) > -1}
                              checked={selectedScreens.indexOf(file.name) > -1}
                            />
                          </div>
                          <Photo
                            onClick={() =>
                              dispatch(
                                openModal("ShowScreenShot", {
                                  ScreenShotsDir,
                                  file
                                })
                              )
                            }
                            selected={selectedScreens.indexOf(file.name) > -1}
                            src={path.join(ScreenShotsDir, file.name)}
                          />
                        </PhotoContainer>
                      </ContextMenuTrigger>
                      <ContextMenu
                        id={file.name}
                        onShow={() => {
                          setIsHoveredName([...selectedScreens, file.name]);
                          setIsHovered(true);
                          if (
                            selectedScreens.length === 0 ||
                            !selectedScreens.includes(file.name)
                          ) {
                            setSelectedScreens([file.name]);
                          }
                        }}
                        onHide={() => {
                          setIsHoveredName([]);
                          setIsHovered(false);
                        }}
                      >
                        {selectedScreens.length > 1 ? (
                          <DeleteAllButton
                            onClick={() =>
                              deleteFile(
                                InstancePath,
                                instanceName,
                                file.name,
                                true,
                                selectedScreens,
                                setSelectedScreens
                              )
                            }
                          >
                            Delete All&nbsp;
                            <FontAwesomeIcon icon={faTrash} />
                          </DeleteAllButton>
                        ) : null}
                        {selectedScreens.length < 2 ? (
                          <>
                            {" "}
                            <MenuItem
                              onClick={() =>
                                deleteFile(
                                  InstancePath,
                                  instanceName,
                                  file.name,
                                  false,
                                  selectedScreens,
                                  setSelectedScreens
                                )
                              }
                            >
                              Delete&nbsp;
                              <FontAwesomeIcon icon={faTrash} />
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                clipboard.writeImage(
                                  path.join(ScreenShotsDir, file.name)
                                );
                              }}
                            >
                              Copy the image&nbsp;
                              <FontAwesomeIcon icon={faCopy} />
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                imgurShare(
                                  path.join(ScreenShotsDir, file.name)
                                );
                              }}
                            >
                              Share the image via url&nbsp;
                              <FontAwesomeIcon icon={faLink} />
                            </MenuItem>{" "}
                          </>
                        ) : (
                          ""
                        )}
                      </ContextMenu>
                    </span>
                  ))}
                </DateSection>
              </span>
            );
          })
        ) : (
          <div
            css={`
              height: 100%;
              text-align: center;
              padding-top: 25%;
            `}
          >
            No ScreensShots Available
          </div>
        )}
      </Container>
    </div>
  );
};

export default ScreenShot;
