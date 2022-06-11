import React, { memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { Button, Input } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo } from '@fortawesome/free-solid-svg-icons';
import { updateCurseForgeApiKey } from '../../../reducers/settings/actions';
import { DefaultCfApiKey } from '../../../api';

const Title = styled.div`
  margin-top: 30px;
  margin-bottom: 5px;
  font-size: 15px;
  font-weight: 700;
  color: ${props => props.theme.palette.text.primary};
  z-index: 1;
  text-align: left;
  -webkit-backface-visibility: hidden;
`;

const Content = styled.div`
  width: 100%;
  text-align: left;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  *:first-child {
    margin-right: 15px;
  }
`;

const CurseforgeApiField = styled.div`
  width: 100%;
  height: 120px;
`;

const StyledButtons = styled(Button)`
  float: right;
`;

const Experimental = () => {
  const dispatch = useDispatch();

  const curseForgeApiKey = useSelector(
    state => state.settings.curseForgeApiKey
  );

  return (
    <>
      <Title>Custom Curseforge API Key</Title>
      <Content>
        <p>
          Due to recent changes to the CurseForge API, you may find certain mods
          are unable to be downloaded via GDLauncher because GDLauncher is not a
          part of CurseForge and is considered a Third Party Application.
        </p>
      </Content>
      <Content>
        <p>
          As such, we provide a default API key (hidden below) that can
          successfully download mods whose authors permit third-party launcher
          downloads. If you have your own CurseForge API key that you would
          rather provide, insert it below.
        </p>
      </Content>
      <Content>
        <p>
          <b>
            For ordinary users, this setting should not need to be changed!!
          </b>
        </p>
      </Content>
      <Content>
        <p>
          If you run into any issues downloading mods, you can revert to
          GDLuancher&apos;s granted API Key using the reset button beside the
          text box.
        </p>
      </Content>

      <CurseforgeApiField>
        <div
          css={`
            margin-top: 20px;
            width: 100%;
          `}
        >
          <Input
            // Automatically hide the default key by default
            placeholder="Will Use The GDLauncher Default API Key"
            value={curseForgeApiKey === DefaultCfApiKey ? '' : curseForgeApiKey}
            onChange={v => dispatch(updateCurseForgeApiKey(v.target.value))}
            css={`
              width: 83% !important;
              height: 32px !important;
              float: left !important;
            `}
          />
          <StyledButtons
            onClick={() => dispatch(updateCurseForgeApiKey(DefaultCfApiKey))}
            color="primary"
          >
            <FontAwesomeIcon icon={faUndo} />
          </StyledButtons>
        </div>
      </CurseforgeApiField>
    </>
  );
};

export default memo(Experimental);
