/* eslint-disable */
import React, { useEffect, useState } from "react";
import { promises as fs } from "fs";
import path from "path";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { _getInstancesPath } from "../../utils/selectors";
import _ from "lodash";

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
  max-height: 600px;
  margin: 10px 0 10px 0;
  &&:first-child {
    margin-top: 0;
  }
`;

const TitleDataSection = styled.h2`
  position: relative;
  top: 65px;
  left: 20px;
`;

const Photo = styled.img`
  height: 100px;
  max-height: 100px;
  width: 100px;
  max-width: 200px;
  margin: 10px;
  background: green;
  border-radius: 5px;
`;

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
        sortedScreens = sortedScreens.concat({ name: element, days: days });
        sortedScreens = sortedScreens.sort((a, b) => {
          let comparison = 0;
          if (a.days > b.days) {
            comparison = 1;
          } else if (a.days < b.days) {
            comparison = -1;
          }
          return comparison;
        });
        console.log("b", days);
      })
    );
    return sortedScreens;
    console.log("a", sortedScreens);
  } catch (e) {
    console.log(e);
  }
};

const ScreenShot = ({ instanceName }) => {
  const InstancePath = useSelector(_getInstancesPath);
  const ScreenShotsDir = path.join(InstancePath, instanceName, "screenshots");
  const [groupedSortedPhotos, setGroupedStortedPhoto] = useState([]);

  useEffect(() => {
    calcDate(ScreenShotsDir).then(sortedScreens => {
      setGroupedStortedPhoto(_.groupBy(sortedScreens, "days"));
      console.log("T", _.groupBy(sortedScreens, "days"));
    });
    console.log("TEST", groupedSortedPhotos);
  }, []);

  return (
    <Container>
      {Object.entries(groupedSortedPhotos).map((key, value) => {
        console.log("CIAO", key[1], value);
        return (
          <>
            <TitleDataSection>Today</TitleDataSection>
            <DateSection>
              {key[1].map(value => (
                <Photo src={path.join(ScreenShotsDir, value.name)} />
              ))}
            </DateSection>
          </>
        );
      })}
    </Container>
  );
};

export default ScreenShot;
