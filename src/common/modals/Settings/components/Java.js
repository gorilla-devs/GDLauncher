import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { ipcRenderer } from 'electron';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faJava } from '@fortawesome/free-brands-svg-icons';
import {
  faMemory,
  faFolder,
  faUndo,
  faLevelDownAlt,
  faList
} from '@fortawesome/free-solid-svg-icons';
import { Slider, Button, Input, Switch } from 'antd';
import {
  updateJavaArguments,
  updateJavaMemory,
  updateJavaPath
} from '../../../reducers/settings/actions';
import { DEFAULT_JAVA_ARGS } from '../../../../app/desktop/utils/constants';
import { _getJavaPath } from '../../../utils/selectors';

const JavaSettings = styled.div`
  width: 100%;
  height: 400px;
`;

const AutodetectPath = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  height: 40px;
`;

const SelectMemory = styled.div`
  width: 100%;
  height: 100px;
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
  color: ${props => props.theme.palette.text.third};
`;

const Hr = styled.hr`
  opacity: 0.29;
  background: ${props => props.theme.palette.secondary.light};
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

const openFolderDialog = async (javaPath, dispatch) => {
  const paths = await ipcRenderer.invoke('openFileDialog', javaPath);
  if (!paths[0]) return;
  dispatch(updateJavaPath(paths[0]));
};

const marks = {
  2048: '2048 MB',
  4096: '4096 MB',
  8192: '8192 MB',
  16384: '16384 MB'
};

export default function MyAccountPreferences() {
  const javaArgs = useSelector(state => state.settings.java.args);
  const javaMemory = useSelector(state => state.settings.java.memory);
  const javaPath = useSelector(_getJavaPath);
  const customJavaPath = useSelector(state => state.settings.java.path);
  const dispatch = useDispatch();

  return (
    <JavaSettings>
      <MainTitle>Java</MainTitle>
      <Title
        css={`
          width: 200px;
          text-align: left;
        `}
      >
        Autodetect Java Path&nbsp; <FontAwesomeIcon icon={faJava} />
      </Title>
      <AutodetectPath>
        <Paragraph
          css={`
            text-align: left;
          `}
        >
          Disable this to specify a custom java path to use instead of using
          openJDK shipped with GDLauncher. Please select the java.exe binary
        </Paragraph>
        <Switch
          color="primary"
          onChange={c => {
            if (c) {
              dispatch(updateJavaPath(null));
            } else {
              dispatch(updateJavaPath(javaPath));
            }
          }}
          checked={!customJavaPath}
        />
      </AutodetectPath>
      {customJavaPath && (
        <>
          <div
            css={`
              height: 40px;
            `}
          >
            <div
              css={`
                width: 100%;
                margin: 20px 0;
              `}
            >
              <FontAwesomeIcon
                icon={faLevelDownAlt}
                flip="horizontal"
                transform={{ rotate: 90 }}
              />
              <Input
                css={`
                  width: 75%;
                  margin: 0 10px;
                `}
                onChange={e => dispatch(updateJavaPath(e.target.value))}
                value={customJavaPath}
              />
              <StyledButtons
                color="primary"
                onClick={() => openFolderDialog(customJavaPath, dispatch)}
              >
                <FontAwesomeIcon icon={faFolder} />
              </StyledButtons>
            </div>
          </div>
        </>
      )}
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
          Select the preferred amount of memory to use when lauching the game
        </Paragraph>
        <Slider
          css={`
            margin: 20px 20px 20px 0;
          `}
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
      </SelectMemory>
      <Hr
        css={`
          margin-top: 40px;
        `}
      />
      <JavaCustomArguments>
        <Title
          css={`
            width: 100%;
            text-align: left;
            margin-bottom: 20px;
          `}
        >
          Java Custom Arguments &nbsp; <FontAwesomeIcon icon={faList} />
        </Title>
        <Paragraph
          css={`
            text-align: left;
          `}
        >
          Select the preferred custom arguments to use when lauching the game
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
              width: 83%;
              height: 32px;
              float: left;
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
    </JavaSettings>
  );
}
