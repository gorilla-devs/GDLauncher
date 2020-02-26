/* eslint-disable */
import React, { useEffect, useState } from "react";
import { promises as fs, watch } from "fs";
import { clipboard } from "electron";
import fse from "fs-extra";
import path from "path";
import styled from "styled-components";
import { Checkbox } from "antd";
import { useSelector } from "react-redux";
import request from "request";
import { ContextMenuTrigger, ContextMenu, MenuItem } from "react-contextmenu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faCopy, faLink } from "@fortawesome/free-solid-svg-icons";
import { _getInstancesPath } from "../../utils/selectors";
import _ from "lodash";
import axios from "axios";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
  background: ${props => props.theme.palette.secondary.main};
  overflow-y: auto;
  overflow-x: hidden;
`;

const Bar = styled.div`
  min-height: 40px;
  width: 100%;
  background: ${props => props.theme.palette.secondary.main};
`;

const DateSection = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap-reverse;
  padding: 50px 10px 20px 10px;
  background: ${props => props.theme.palette.secondary.dark};
  margin: 10px 0 10px 0;
  &&:first-child {
    margin-top: 0;
  }
`;

const DeleteButton = styled(FontAwesomeIcon)`
  margin-left: 10px;
  transition: color 0.3s ease-in-out;
  &&:hover {
    path {
      color: ${props => props.theme.palette.colors.red};
    }
  }
`;

const DeletAllButton = styled(MenuItem)`
  && {
    background: ${props => props.theme.palette.colors.red};
  }
  &&:hover {
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
  height: 100px;
  border: ${props =>
    props.selected ? `solid 2px ${props.theme.palette.colors.blue}` : ""};
  transform: ${x =>
    x.isHovered && x.name == x.isHoveredName ? "scale(1.2)" : "scale(1)"};
  &&:hover {
    transform: scale(1.2);
  }
`;

const deleteFile = async (
  InstancePath,
  instanceName,
  fileName,
  multipleOrNot,
  selectedScreens,
  setSelectedScreens
) => {
  console.log("LOLL11", selectedScreens);
  if (!multipleOrNot) {
    await fse.remove(
      path.join(InstancePath, instanceName, "screenshots", fileName)
    );
    setSelectedScreens([
      selectedScreens.splice(selectedScreens.indexOf(fileName), 1)
    ]);
  } else {
    Promise.all(
      selectedScreens.map(async screenShot => {
        await fse.remove(
          path.join(InstancePath, instanceName, "screenshots", screenShot)
        );
        setSelectedScreens([
          selectedScreens.splice(selectedScreens.indexOf(fileName), 1)
        ]);
      })
    );
  }
  console.log("LOLL", selectedScreens);
};

const calcDate = async ScreenShotsDir => {
  const screens = await fs.readdir(ScreenShotsDir);
  let sortedScreens = [];
  try {
    await Promise.all(
      screens.map(async element => {
        const screenTime = await (
          await fs.stat(path.join(ScreenShotsDir, element))
        ).birthtimeMs;
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
  const clientId = "18d87e44184ea34";

  let screenShot = await fs.readFile(image);

  let b64Img = screenShot.toString("base64");

  var bodyFormData = new FormData();
  bodyFormData.append("image", b64Img);

  const res = await axios.post("https://api.imgur.com/3/image", bodyFormData, {
    headers: {
      Authorization: `Client-ID ${clientId}`
    }
  });

  if (res.status == 200) {
    console.log(res.data.data.link);
    clipboard.writeText(res.data.data.link);
  } else {
    console.error;
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

const startListener = (ScreenShotsDir, selectedScreens, setSelectedScreens) => {
  watch(ScreenShotsDir, (event, filename) => {
    console.log("piripicchio");
    if (filename) {
      updateState(ScreenShotsDir, selectedScreens, setSelectedScreens);
      console.log(`${filename} file Changed`);
    }
  });
};

const updateState = (ScreenShotsDir, selectedScreens, setSelectedScreens) => {};

const selectAll = async (
  setSelectedScreens,
  ScreenShotsDir,
  selectedScreens
) => {
  const screens = await fs.readdir(ScreenShotsDir);

  if (screens.sort().join(",") === selectedScreens.sort().join(",")) {
    setSelectedScreens([]);
  } else setSelectedScreens(screens);
};

const ScreenShot = ({ instanceName }) => {
  const InstancePath = useSelector(_getInstancesPath);
  const ScreenShotsDir = path.join(InstancePath, instanceName, "screenshots");
  const [groupedSortedPhotos, setGroupedStortedPhoto] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [isHoveredName, setIsHoveredName] = useState("");
  const [selectedScreens, setSelectedScreens] = useState([]);

  useEffect(() => {
    calcDate(ScreenShotsDir).then(sortedScreens => {
      setGroupedStortedPhoto(_.groupBy(sortedScreens, "days"));
    });
    startListener(ScreenShotsDir, selectedScreens, setSelectedScreens);

    // listener.on("error", async () => {
    //   // Check if the folder exists and create it if it doesn't
    //   await makeDir(ScreenShotsDir);
    //   if (!listener.isClosed()) {
    //     listener.close();
    //   }
    //   startListener();
    // });
  }, []);

  return (
    <div
      css={`
        display: flex;
        flex-direction: column;
        width: 100%;
      `}
    >
      <Bar>
        <Checkbox
          onChange={() =>
            selectAll(setSelectedScreens, ScreenShotsDir, selectedScreens)
          }
          css={`
            margin: 7px 20px;
          `}
        />

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
          icon={faTrash}
        />
      </Bar>
      <Container>
        {Object.entries(groupedSortedPhotos).map(([key, value]) => {
          return (
            <span
              key={key}
              css={`
                &&:first-child {
                  margin-top: -45px;
                }
              `}
            >
              <TitleDataSection>
                {calcDateTitle(key.toString())}
              </TitleDataSection>
              <DateSection>
                {value.map(file => (
                  <span key={file.name}>
                    <ContextMenuTrigger id={file.name}>
                      <Photo
                        onClick={() => {
                          console.log(
                            selectedScreens,
                            file.name,
                            selectedScreens.indexOf(file.name) > -1
                          );
                          selectedScreens.indexOf(file.name) > -1
                            ? setSelectedScreens(
                                selectedScreens.filter(x => x != file.name)
                              )
                            : setSelectedScreens([
                                ...selectedScreens,
                                file.name
                              ]);
                        }}
                        selected={selectedScreens.indexOf(file.name) > -1}
                        isHoveredName={isHoveredName}
                        name={file.name}
                        isHovered={isHovered}
                        src={path.join(ScreenShotsDir, file.name)}
                      />
                    </ContextMenuTrigger>
                    <ContextMenu
                      id={file.name}
                      onShow={() => {
                        setIsHoveredName(file.name);
                        setIsHovered(true);
                      }}
                      onHide={() => {
                        setIsHoveredName("");
                        setIsHovered(false);
                      }}
                    >
                      {selectedScreens.length > 1 ? (
                        <DeletAllButton
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
                          Delete All&nbsp;
                          <FontAwesomeIcon icon={faTrash} />
                        </DeletAllButton>
                      ) : null}

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
                          imgurShare(path.join(ScreenShotsDir, file.name));
                        }}
                      >
                        Share the image via url&nbsp;
                        <FontAwesomeIcon icon={faLink} />
                      </MenuItem>
                    </ContextMenu>
                  </span>
                ))}
              </DateSection>
            </span>
          );
        })}
      </Container>
    </div>
  );
};

export default ScreenShot;
