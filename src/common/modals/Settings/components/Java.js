import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled, { useTheme } from 'styled-components';
import { ipcRenderer } from 'electron';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faJava } from '@fortawesome/free-brands-svg-icons';
import {
  faMemory,
  faUndo,
  faList,
  faDesktop,
  faPlay,
  faExchangeAlt
} from '@fortawesome/free-solid-svg-icons';
import { Slider, Button, Input, Switch, Select } from 'antd';
import {
  updateJavaArguments,
  updateJavaMemory,
  updateMcStartupMethod,
  updateResolution
} from '../../../reducers/settings/actions';
import {
  DEFAULT_JAVA_ARGS,
  resolutionPresets
} from '../../../../app/desktop/utils/constants';
import { openModal } from '../../../reducers/modals/actions';
import { MC_STARTUP_METHODS } from '../../../utils/constants';

const AutodetectPath = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  height: 40px;
  margin-bottom: 30px;
`;

const SelectMemory = styled.div`
  width: 100%;
  height: 100px;
`;

const Resolution = styled.div`
  width: 100%;
  height: 100px;
`;

const McStartupMethod = styled.div`
  width: 100%;
  height: 100px;
`;

const McStartupMethodRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  height: 40px;
  margin-bottom: 30px;
`;

const ResolutionInputContainer = styled.div`
  margin-top: 10px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  div {
    width: 200px;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
`;

const JavaCustomArguments = styled.div`
  width: 100%;
  height: 120px;
`;

const Title = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: ${props => props.theme.palette.text.secondary};
`;

const Paragraph = styled.p`
  max-width: 510px;
  color: ${props => props.theme.palette.text.third};
`;

const Hr = styled.div`
  height: 35px;
`;

const MainTitle = styled.h1`
  color: ${props => props.theme.palette.text.primary};
  width: 80px;
  margin: 30px 0 20px 0;
`;

const StyledButtons = styled(Button)`
  float: right;
`;

function resetJavaArguments(dispatch) {
  dispatch(updateJavaArguments(DEFAULT_JAVA_ARGS));
}

const marks = {
  2048: '2048 MB',
  4096: '4096 MB',
  8192: '8192 MB',
  16384: '16384 MB',
  32768: '32768 MB'
};

export default function MyAccountPreferences() {
  const [screenResolution, setScreenResolution] = useState(null);
  const javaArgs = useSelector(state => state.settings.java.args);
  const javaMemory = useSelector(state => state.settings.java.memory);
  const customJavaPath = useSelector(state => state.settings.java.path);
  const customJava16Path = useSelector(state => state.settings.java.path16);
  const mcStartupMethod = useSelector(state => state.settings.mcStartupMethod);
  const mcResolution = useSelector(
    state => state.settings.minecraftSettings.resolution
  );
  const dispatch = useDispatch();
  const theme = useTheme();

  useEffect(() => {
    ipcRenderer
      .invoke('getAllDisplaysBounds')
      .then(setScreenResolution)
      .catch(console.error);
  }, []);

  return (
    <>
      <MainTitle>Java</MainTitle>
      <Title
        css={`
          width: 500px;
          text-align: left;
        `}
      >
        Autodetect Java Path&nbsp; <FontAwesomeIcon icon={faJava} />
        <a
          css={`
            margin-left: 30px;
          `}
          onClick={() => {
            dispatch(openModal('JavaSetup'));
          }}
        >
          Run Java Setup again
        </a>
      </Title>
      <AutodetectPath>
        <Paragraph
          css={`
            text-align: left;
          `}
        >
          Disable this to specify a custom java path to use instead of using
          openJDK shipped with GDLauncher. If that is the case select the path
          to the Java Runtime Environment to use.
        </Paragraph>
        <Switch
          color="primary"
          onChange={c => {
            if (c) {
              dispatch(openModal('JavaSetup', { beginChoice: 1 }));
            } else {
              dispatch(openModal('JavaSetup', { beginChoice: 2 }));
            }
          }}
          checked={!customJavaPath && !customJava16Path}
        />
      </AutodetectPath>
      {(customJavaPath || customJava16Path) && (
        <>
          <div
            css={`
              margin: 10px 0;
              display: flex;
              align-items: center;
              justify-content: space-between;
              text-align: left;
              h3 {
                margin: 0;
                width: 65px;
              }
              span {
                width: 75% !important;
                padding-left: 12px;
              }
              pre {
                width: 75% !important;
                margin: 0;
                padding: 0 8px;
                border: 5px solid ${theme.palette.grey['800']};
                border-radius: 2px;
                background-color: ${theme.palette.grey['800']};
                font-family: 'Inter';
                &::-webkit-scrollbar {
                  display: none;
                }
            `}
          >
            <h3>Java 8 </h3>
            {customJavaPath ? (
              <pre>{customJavaPath}</pre>
            ) : (
              <span>Shipped OpenJDK</span>
            )}
            <StyledButtons
              color="primary"
              onClick={() =>
                dispatch(openModal('JavaSetup', { beginChoice: 2 }))
              }
            >
              <FontAwesomeIcon icon={faExchangeAlt} />
            </StyledButtons>
          </div>
          <div
            css={`
              margin: 10px 0;
              display: flex;
              align-items: center;
              justify-content: space-between;
              h3 {
                margin: 0;
                width: 65px;
              }
              span {
                width: 75% !important;
                padding-left: 12px;
              }
              pre {
                width: 75% !important;
                margin: 0;
                padding: 0 8px;
                border: 5px solid ${theme.palette.grey['800']};
                border-radius: 2px;
                background-color: ${theme.palette.grey['800']};
                font-family: 'Inter';
                &::-webkit-scrollbar {
                  display: none;
                }
              }
            `}
          >
            <h3>Java 16 </h3>
            {customJava16Path ? (
              <pre>{customJava16Path}</pre>
            ) : (
              <span>Shipped OpenJDK</span>
            )}
            <StyledButtons
              color="primary"
              onClick={() =>
                dispatch(openModal('JavaSetup', { beginChoice: 2 }))
              }
            >
              <FontAwesomeIcon icon={faExchangeAlt} />
            </StyledButtons>
          </div>
        </>
      )}
      <Hr />
      <Resolution>
        <Title
          css={`
            width: 100%;
            margin-top: 0px;
            height: 8px;
            text-align: left;
            margin-bottom: 20px;
          `}
        >
          Game Resolution&nbsp; <FontAwesomeIcon icon={faDesktop} />
        </Title>
        <Paragraph
          css={`
            width: 100%;
            text-align: left;
            margin: 0;
          `}
        >
          Select the initial game resolution in pixels (width x height)
        </Paragraph>
        <ResolutionInputContainer>
          <div>
            <Input
              placeholder="width"
              value={mcResolution.width}
              onChange={e => {
                const w = parseInt(e.target.value, 10);
                dispatch(updateResolution({ width: w || 854 }));
              }}
            />
            &nbsp;X&nbsp;
            <Input
              placeholder="Height"
              value={mcResolution.height}
              onChange={e => {
                const h = parseInt(e.target.value, 10);
                dispatch(updateResolution({ height: h || 480 }));
              }}
            />
          </div>
          <Select
            placeholder="Presets"
            onChange={v => {
              const w = parseInt(v.split('x')[0], 10);
              const h = parseInt(v.split('x')[1], 10);
              dispatch(updateResolution({ height: h, width: w }));
            }}
            virtual={false}
          >
            {resolutionPresets.map(v => {
              const w = parseInt(v.split('x')[0], 10);
              const h = parseInt(v.split('x')[1], 10);

              const isBiggerThanScreen = (screenResolution || []).every(
                bounds => {
                  return bounds.width < w || bounds.height < h;
                }
              );
              if (isBiggerThanScreen) return null;
              return (
                <Select.Option key={v} value={v}>
                  {v}
                </Select.Option>
              );
            })}
          </Select>
        </ResolutionInputContainer>
      </Resolution>
      <Hr />
      <SelectMemory>
        <Title
          css={`
            width: 100%;
            margin-top: 0px;
            height: 8px;
            text-align: left;
            margin-bottom: 20px;
          `}
        >
          Java Memory&nbsp; <FontAwesomeIcon icon={faMemory} />
        </Title>
        <Paragraph
          css={`
            width: 100%;
            text-align: left;
            margin: 0;
          `}
        >
          Select the preferred amount of memory to use when launching the game
        </Paragraph>
        <Slider
          css={`
            margin: 20px 20px 20px 0;
          `}
          onAfterChange={e => {
            dispatch(updateJavaMemory(e));
          }}
          defaultValue={javaMemory}
          min={1024}
          max={process.getSystemMemoryInfo().total / 1024}
          step={512}
          marks={marks}
          valueLabelDisplay="auto"
        />
      </SelectMemory>
      <Hr />
      <JavaCustomArguments>
        <Title
          css={`
            width: 100%;
            text-align: left;
          `}
        >
          Java Custom Arguments &nbsp; <FontAwesomeIcon icon={faList} />
        </Title>
        <Paragraph
          css={`
            text-align: left;
          `}
        >
          Select the preferred custom arguments to use when launching the game
        </Paragraph>
        <div
          css={`
            margin-top: 20px;
            width: 100%;
          `}
        >
          <Input
            onChange={e => dispatch(updateJavaArguments(e.target.value))}
            value={javaArgs}
            css={`
              width: 83% !important;
              height: 32px !important;
              float: left !important;
            `}
          />
          <StyledButtons
            onClick={() => resetJavaArguments(dispatch)}
            color="primary"
          >
            <FontAwesomeIcon icon={faUndo} />
          </StyledButtons>
        </div>
      </JavaCustomArguments>
      <Hr />
      <McStartupMethod>
        <Title
          css={`
            width: 70%;
            text-align: left;
          `}
        >
          Minecraft Startup Method &nbsp; <FontAwesomeIcon icon={faPlay} />
        </Title>
        <McStartupMethodRow>
          <Paragraph
            css={`
              text-align: left;
            `}
          >
            Select the preferred Minecraft startup method. Only change this if
            you&apos;re experiencing issues with the default one.
          </Paragraph>
          <Select
            value={mcStartupMethod}
            onChange={v => dispatch(updateMcStartupMethod(v))}
          >
            {Object.entries(MC_STARTUP_METHODS).map(([k, v]) => {
              return (
                <Select.Option key={k} value={k}>
                  {v}
                </Select.Option>
              );
            })}
          </Select>
        </McStartupMethodRow>
      </McStartupMethod>
    </>
  );
}
