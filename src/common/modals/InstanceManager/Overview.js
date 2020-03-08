import React, { useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { promises as fs } from "fs";
import path from "path";
import { Card, Slider, Button, Input, Switch, Select } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faUndoAlt } from "@fortawesome/free-solid-svg-icons";
import { _getInstancesPath } from "../../utils/selectors";
import {
  updateJavaArguments,
  updateJavaMemory
} from "../../reducers/settings/actions";
import { DEFAULT_JAVA_ARGS } from "../../../app/desktop/utils/constants";
// import { downloadForge } from "../../reducers/actions";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  text-align: center;
`;

const MainTitle = styled.h1`
  color: ${props => props.theme.palette.text.primary};
  margin: 0 500px 20px 0;
  margin-bottom: 20px;
  float: left;
`;

const SettingsContainer = styled.div`
  flex: 1;
  flex-grow: 3;
  background: ${props => props.theme.palette.secondary.main};
`;

const SettingsColumn = styled.div`
  margin-left: 50px;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
`;

const RenameContainer = styled.div`
  width: 90%;
  max-width: 700px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const RenameButton = styled(Button)`
  margin: 0 0 0 100px;
`;

const RenameInput = styled(Input)`
  max-width: 700px;
`;

const ForgeManagerCard = styled(Card)`
  margin-top: 30px;
  width: 90%;
  max-width: 700px;
  display: flex;
  flex-direction: column;
`;

const JavaManagerCard = styled(Card)`
  margin-top: 30px;
  width: 90%;
  max-width: 700px;
`;

const OptifineCard = styled(Card)`
  margin-top: 30px;
  width: 90%;
  max-width: 700px;
`;

const JavaLegacyFixContainer = styled.div`
  margin: 30px 0;
  width: 90%;
  max-width: 700px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const JavaManagerOptionContainer = styled.div`
  margin-top: 10px;
  min-width: 90%;
  max-width: 700px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const JavaManagerRowContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const JavaMemorySlider = styled(Slider)`
  margin: 20px 0 50px 0;
`;

const OptifineVersionSelect = styled(Select)`
  width: 100px;
  margin-right: 20px;
`;

const ForgeVersionSelect = styled(Select)`
  width: 100px;
  margin: 0 20px;
`;

const marks = {
  2048: "2048 MB",
  4096: "4096 MB",
  8192: "8192 MB",
  16384: "16384 MB"
};

const Overview = ({ instanceName }) => {
  const [name, setName] = useState(instanceName);
  const [javaMemorySwitch, setJavaMemorySwitch] = useState(false);
  const [javaArgumentswitch, setJavaArgumentswitch] = useState(false);
  const [optifineSwitch, setOptifineSwitch] = useState(false);
  const javaArgs = useSelector(state => state.settings.java.args);
  const javaMemory = useSelector(state => state.settings.java.memory);

  const dispatch = useDispatch();
  const instancesPath = useSelector(_getInstancesPath);

  const renameInstace = async newName => {
    const instancePath = path.join(instancesPath, instanceName);
    const newInstanceName = path.join(instancesPath, newName);
    await fs.rename(instancePath, newInstanceName);
  };

  function resetJavaArguments(dispatch) {
    dispatch(updateJavaArguments(DEFAULT_JAVA_ARGS));
  }

  return (
    <Container>
      <SettingsContainer>
        <SettingsColumn>
          <MainTitle>Overview</MainTitle>
          <RenameContainer>
            <RenameInput value={name} onChange={e => setName(e.target.value)} />
            <RenameButton onClick={() => renameInstace(name)}>
              Rename&nbsp; <FontAwesomeIcon icon={faSave} />
            </RenameButton>
          </RenameContainer>
          <ForgeManagerCard
            headStyle={{
              background: `${props => props.theme.palette.primary.main}`
            }}
            title="Forge Manager"
          >
            <div>No forge version installed</div>
            <div
              css={`
                margin-top: 20px;
              `}
            >
              <ForgeVersionSelect />
              <Button>Install Forge</Button>
            </div>
          </ForgeManagerCard>
          <JavaManagerCard title="Java Manager Override">
            <JavaManagerOptionContainer>
              JavaMemory{" "}
              <Switch
                value={javaMemorySwitch}
                onChange={e => setJavaMemorySwitch(e)}
              />
            </JavaManagerOptionContainer>
            {javaMemorySwitch && (
              <div>
                <JavaMemorySlider
                  onChange={e => {
                    dispatch(updateJavaMemory(e));
                  }}
                  defaultValue={javaMemory}
                  min={1024}
                  max={16384}
                  step={512}
                  marks={marks}
                  valueLabelDisplay="auto"
                />
              </div>
            )}

            <JavaManagerOptionContainer>
              JavaArguments{" "}
              <Switch
                value={javaArgumentswitch}
                onChange={e => setJavaArgumentswitch(e)}
              />
            </JavaManagerOptionContainer>
            {javaArgumentswitch && (
              <div
                css={`
                  margin: 20px 0 0 0;
                `}
              >
                <JavaManagerRowContainer>
                  <Input
                    value={javaArgs}
                    onChange={e =>
                      dispatch(updateJavaArguments(e.target.value))
                    }
                  />
                  <Button
                    css={`
                      margin-left: 20px;
                    `}
                    onClick={() => resetJavaArguments(dispatch)}
                  >
                    <FontAwesomeIcon icon={faUndoAlt} />
                  </Button>
                </JavaManagerRowContainer>
              </div>
            )}
          </JavaManagerCard>
          <OptifineCard>
            Automatically inject optifine on startup
            <div
              css={`
                margin-top: 20px;
              `}
            >
              <div>
                <OptifineVersionSelect />
                <Switch
                  value={optifineSwitch}
                  onChange={e => setOptifineSwitch(e)}
                />
              </div>
              {optifineSwitch && (
                <Button
                  css={`
                    margin-top: 20px;
                  `}
                >
                  Install Optifine
                </Button>
              )}
            </div>
          </OptifineCard>
          <JavaLegacyFixContainer>
            Automatically inject legacyJavaFixer on startup
            <Switch />
          </JavaLegacyFixContainer>
        </SettingsColumn>
      </SettingsContainer>
    </Container>
  );
};

export default Overview;
