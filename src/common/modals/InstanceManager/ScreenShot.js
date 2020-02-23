import React, { useEffect } from "react";
import { promises as fs } from "fs";
import path from "path";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { _getInstancesPath } from "../../utils/selectors";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  background: ${props => props.theme.palette.secondary.main};
  overflow-y: auto;
`;

const DateSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px;
  background: ${props => props.theme.palette.secondary.dark};
  max-height: 520px;
  margin: 10px 0 10px 0;
  &&:first-child {
    margin-top: 0;
  }
`;

const TitleDataSection = styled.h2`
  margin: 5px;
`;

const PhotoRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`;

const Photo = styled.div`
  height: 100px;
  max-height: 100px;
  width: 100px;
  max-width: 100px;
  margin: 10px;
  background: green;
  border-radius: 5px;
`;

const calcDate = async ScreenShotsDir => {
  const screens = await fs.readdir(ScreenShotsDir);
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
        console.log(days, date, screenTime);
      })
    );
  } catch (e) {
    console.log(e);
  }
};

const ScreenShot = ({ instanceName }) => {
  const InstancePath = useSelector(_getInstancesPath);
  const ScreenShotsDir = path.join(InstancePath, instanceName, "screenshots");
  // const date = new Date();

  useEffect(() => {
    calcDate(ScreenShotsDir);
  }, []);

  return (
    <Container>
      <DateSection>
        <TitleDataSection>Today</TitleDataSection>
        <PhotoRow>
          <Photo />
          <Photo />
          <Photo />
        </PhotoRow>
        <PhotoRow>
          <Photo />
          <Photo />
        </PhotoRow>
        <PhotoRow>
          <Photo />
          <Photo />
          <Photo />
          <Photo />
        </PhotoRow>
      </DateSection>
      <DateSection>
        <TitleDataSection>Yesterday</TitleDataSection>
        <PhotoRow>
          <Photo />
          <Photo />
          <Photo />
        </PhotoRow>
        <PhotoRow>
          <Photo />
          <Photo />
          <Photo />
          <Photo />
        </PhotoRow>
        <PhotoRow>
          <Photo />
          <Photo />
          <Photo />
          <Photo />
        </PhotoRow>
      </DateSection>
      <DateSection>
        <TitleDataSection>2 Days ago</TitleDataSection>
        <PhotoRow>
          <Photo />
          <Photo />
          <Photo />
        </PhotoRow>
        <PhotoRow>
          <Photo />
          <Photo />
          <Photo />
        </PhotoRow>
        <PhotoRow>
          <Photo />
          <Photo />
          <Photo />
          <Photo />
        </PhotoRow>
      </DateSection>
    </Container>
  );
};

export default ScreenShot;
