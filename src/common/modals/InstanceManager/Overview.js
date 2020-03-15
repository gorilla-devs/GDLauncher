/* eslint-disable */
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import fss from "fs-extra";
import path from "path";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faUndo } from "@fortawesome/free-solid-svg-icons";
import { Input, Button, Card, Switch, Select, Slider } from "antd";
import { _getInstancesPath } from "../../utils/selectors";
import {
  updateJavaArguments,
  updateJavaMemory
} from "../../reducers/settings/actions";
import { DEFAULT_JAVA_ARGS } from "../../../app/desktop/utils/constants";

const Container = styled.div`
  margin-left: 50px;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
`;

const Column = styled.div`
  max-width: 600px;
`;

const MainTitle = styled.h1`
  color: ${props => props.theme.palette.text.primary};
  margin: 0 500px 20px 0;
  margin-bottom: 20px;
`;

const RenameRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  color: ${props => props.theme.palette.text.primary};
  margin: 0 500px 20px 0;
  width: 100%;
`;

const RenameButton = styled(Button)`
  margin-left: 20px;
`;

const ForgeManagerCard = styled(Card)`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
`;

const ForgeManagerRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  color: ${props => props.theme.palette.text.primary};
  margin: 0 500px 20px 0;
  width: 100%;
`;

const ForgeVersionList = styled(Select)`
  width: 100px;
`;

const JavaManagerCard = styled(Card)`
  margin-bottom: 20px;
  padding: 0;
`;

const OptifineCard = styled(Card)`
  margin-bottom: 20px;
  padding: 0;
`;

const JavaManagerRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  color: ${props => props.theme.palette.text.primary};
  margin: 0 500px 20px 0;
  width: 100%;
`;

const JavaMemorySlider = styled(Slider)`
  margin: 30px 0 55px 0;
`;

const JavaArgumentsResetButton = styled(Button)`
  margin-left: 20px;
`;

const LegacyJavaFixerRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  color: ${props => props.theme.palette.text.primary};
  margin: 0 500px 20px 0;
  width: 100%;
`;

const marks = {
  2048: "2048 MB",
  4096: "4096 MB",
  8192: "8192 MB",
  16384: "16384 MB"
};

const Overview = ({ instanceName }) => {
  const javaMemory = useSelector(state => state.settings.java.memory);
  const javaArgs = useSelector(state => state.settings.java.args);
  const instancesPath = useSelector(_getInstancesPath);
  const [ForgeSwitch, setForgeSwitch] = useState(false);
  const [JavaMemorySwitch, setJavaMemorySwitch] = useState(false);
  const [JavaArgumentsSwitch, setJavaArgumentsSwitch] = useState(false);
  const [newName, setNewName] = useState(instanceName);

  const dispatch = useDispatch();

  const rename = () => {
    fss.rename(
      path.join(instancesPath, instanceName),
      path.join(instancesPath, newName)
    );
  };

  function resetJavaArguments() {
    dispatch(updateJavaArguments(DEFAULT_JAVA_ARGS));
  }

  return (
    <Container>
      <Column>
        <MainTitle>Overview</MainTitle>
        <RenameRow>
          <Input value={newName} onChange={e => setNewName(e.target.value)} />
          <RenameButton onClick={() => rename()}>
            Rename&nbsp;
            <FontAwesomeIcon icon={faSave} />
          </RenameButton>
        </RenameRow>
        <ForgeManagerCard title="Forge Manager">
          <ForgeManagerRow>
            <ForgeVersionList />
            <Switch value={ForgeSwitch} onChange={e => setForgeSwitch(e)} />
          </ForgeManagerRow>
          {ForgeSwitch && (
            <ForgeManagerRow>
              <Button type="primary">Install Forge</Button>
            </ForgeManagerRow>
          )}
        </ForgeManagerCard>
        <OptifineCard title="Optifine">
          <ForgeManagerRow>
            <ForgeVersionList />
            <Switch value={ForgeSwitch} onChange={e => setForgeSwitch(e)} />
          </ForgeManagerRow>
          {ForgeSwitch && (
            <ForgeManagerRow>
              <Button type="primary">Install Forge</Button>
            </ForgeManagerRow>
          )}
        </OptifineCard>
        <JavaManagerCard title="Java Manager">
          <JavaManagerRow>
            <div>Java Memory</div>{" "}
            <Switch
              value={JavaMemorySwitch}
              onChange={e => setJavaMemorySwitch(e)}
            />
          </JavaManagerRow>
          {JavaMemorySwitch && (
            <div>
              <JavaMemorySlider
                onChange={e => dispatch(updateJavaMemory(e))}
                defaultValue={javaMemory}
                min={1024}
                max={16384}
                step={512}
                marks={marks}
                valueLabelDisplay="auto"
              />
            </div>
          )}
          <JavaManagerRow>
            <div>Java Arguments</div>{" "}
            <Switch
              value={JavaArgumentsSwitch}
              onChange={e => setJavaArgumentsSwitch(e)}
            />
          </JavaManagerRow>
          {JavaArgumentsSwitch && (
            <JavaManagerRow>
              <Input
                value={javaArgs}
                onChange={e => dispatch(updateJavaArguments(e.target.value))}
              />
              <JavaArgumentsResetButton onClick={() => resetJavaArguments()}>
                <FontAwesomeIcon icon={faUndo} />
              </JavaArgumentsResetButton>
            </JavaManagerRow>
          )}
        </JavaManagerCard>
        <LegacyJavaFixerRow>
          <div>LegacyJavaFixer</div>
          <Switch />
        </LegacyJavaFixerRow>
      </Column>
    </Container>
  );
};

export default Overview;
