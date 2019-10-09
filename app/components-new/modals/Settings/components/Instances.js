import React, { useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faFolder } from '@fortawesome/free-solid-svg-icons';
import { Slider, Button, Switch } from 'ui';
import logo from '../../../../../../GDLauncher/app/assets/images/logo.png';
import { Input } from '@material-ui/core';

const Instances = styled.div`
  width: 100%;
  height: 500px;
`;

const AutodetectPath = styled.div`
  margin-top: 38px;
  margin-bottom: 20px;
  width: 100%;
  height: 120px;
`;

const OverridePath = styled.div`
  width: 100%;
  height: 90px;
`;

const InstanceCustomPath = styled.div`
  width: 100%;
  height: 120px;
`;

const Title = styled.h3`
  position: absolute;
  font-size: 15px;
  font-weight: 700;
  color: ${props => props.theme.palette.text.main};
`;

const Paragraph = styled.p`
  text-align: left;
  color: ${props => props.theme.palette.text.third};
  width: 400px;
`;

const HR = styled.hr`
  opacity: 0.29;
  background: ${props => props.theme.palette.secondary.light};
`;

const SettingsButton = styled(Button)`
  background: ${props => props.theme.palette.primary.main};
`;

export default function MyAccountPreferences() {
  const [selectedInputValue, setSelectedInputValue] = useState('');
  return (
    <Instances>
      <h1
        css={`
          float: left;
          margin: 0;
        `}
      >
        Instances
      </h1>
      <AutodetectPath>
        <Title
          css={`
            position: absolute;
            top: 80px;
          `}
        >
          Clear Shared Data&nbsp; <FontAwesomeIcon icon={faTrash} />
        </Title>
        <Paragraph
          css={`
            position: absolute;
            top: 100px;
          `}
        >
          Deletes all the shared files between instances. Doing this will result
          in the complete loss of the instances data
        </Paragraph>
        <SettingsButton
          css={`
            position: absolute;
            top: 110px;
            right: 0px;
          `}
        >
          Clear
        </SettingsButton>
      </AutodetectPath>
      <HR />
      <OverridePath>
        <Title
          css={`
            position: absolute;
            top: 180px;
          `}
        >
          Override Default Instance Path&nbsp;{' '}
          <FontAwesomeIcon icon={faFolder} />
        </Title>
        <Paragraph
          css={`
            position: absolute;
            top: 200px;
          `}
        >
          If enabled, instances will be downloaded in the selected path you need
          to restart the launcher for this settings to applay
        </Paragraph>
        <Switch
          css={`
            position: absolute;
            top: 220px;
            right: 0px;
          `}
          color="primary"
        />
      </OverridePath>
      <HR />
      <InstanceCustomPath>
        <Title>Instance Custom Path</Title>
        <Paragraph
          css={`
            position: absolute;
            top: 340px;
          `}
        >
          Select the preferred Path to install you instances
        </Paragraph>
        <Input
          css={`
            position: absolute;
            top: 390px;
            left: 0;
            width: 80%;
          `}
        />
        <SettingsButton
          css={`
            position: absolute;
            top: 400px;
            right: 0px;
          `}
        >
          <FontAwesomeIcon icon={faFolder} />
        </SettingsButton>
      </InstanceCustomPath>
    </Instances>
  );
}
