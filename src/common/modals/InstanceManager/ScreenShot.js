/* eslint-disable */
import React, { useEffect, useState } from "react";
import { promises as fs } from "fs";
import fse from "fs-extra";
import path from "path";
import styled from "styled-components";
import { useSelector } from "react-redux";
import request from "request";
import { ContextMenuTrigger, ContextMenu, MenuItem } from "react-contextmenu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
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
  &&:first-child {
    margin-top: 0;
  }
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
  transform: ${x =>
    x.isHovered && x.name == x.isHoveredName ? "scale(1.2)" : "scale(1)"};
  &&:hover {
    transform: scale(1.2);
  }
`;

const deleteFile = async (InstancePath, instanceName, fileName) => {
  console.log(fileName);
  await fse.remove(
    path.join(InstancePath, instanceName, "screenshots", fileName)
  );
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
        console.log(days);
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
  // let data = Buffer.from(str, "base64");

  console.log("data", b64Img);

  var options = {
    method: "POST",
    url: "https://api.imgur.com/3/image",
    headers: {
      Authorization: `Client-ID ${clientId}`
    },
    formData: {
      image: b64Img,
      type: "image/png"
    }
  };

  // request(options, function(error, response) {
  //   if (error) throw new Error(error);
  //   console.log(response.body);
  // });

  axios(options)
    .then(function(response) {
      console.log(response);
    })
    .catch(function(error) {
      console.log(error);
    });
};

const calcDateTitle = days => {
  const parsedDays = Number.parseInt(days, 10);
  console.log(parsedDays);
  if (parsedDays === 0) return "Today";
  else if (parsedDays === 1) return "Yesterday";
  else if (parsedDays > 1 && parsedDays < 30) return `${days} days ago`;
  else if (parsedDays >= 30 && parsedDays < 365)
    return `${Math.floor(days / 30)} months ago`;
  else if (parsedDays >= 365) return `${Math.floor(days / 365)} years ago`;
};

const startListener = async ScreenShotsDir => {
  fs.watch(ScreenShotsDir, (event, filename) => {
    if (filename) {
      console.log(`${filename} file Changed`);
    }
  });
};

const ScreenShot = ({ instanceName }) => {
  const InstancePath = useSelector(_getInstancesPath);
  const ScreenShotsDir = path.join(InstancePath, instanceName, "screenshots");
  const [groupedSortedPhotos, setGroupedStortedPhoto] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [isHoveredName, setIsHoveredName] = useState("");

  useEffect(() => {
    calcDate(ScreenShotsDir).then(sortedScreens => {
      setGroupedStortedPhoto(_.groupBy(sortedScreens, "days"));
    });
    // startListener(ScreenShotsDir);

    // listener.on("error", async () => {
    //   // Check if the folder exists and create it if it doesn't
    //   await makeDir(ScreenShotsDir);
    //   if (!listener.isClosed()) {
    //     listener.close();
    //   }
    //   startListener();
    // });
  }, []);

  console.log(groupedSortedPhotos);
  return (
    <Container>
      {Object.entries(groupedSortedPhotos).map(([key, value]) => {
        return (
          <span key={key}>
            <TitleDataSection>{calcDateTitle(key.toString())}</TitleDataSection>
            <DateSection>
              {value.map(file => (
                <span key={file.name}>
                  <ContextMenuTrigger id={file.name}>
                    <Photo
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
                    <MenuItem
                      onClick={() =>
                        deleteFile(InstancePath, instanceName, file.name)
                      }
                    >
                      Delete&nbsp;
                      <FontAwesomeIcon icon={faTrash} />
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        imgurShare(path.join(ScreenShotsDir, file.name));
                      }}
                    >
                      Copy the image
                    </MenuItem>
                  </ContextMenu>
                </span>
              ))}
            </DateSection>
          </span>
        );
      })}
    </Container>
  );
};

export default ScreenShot;
