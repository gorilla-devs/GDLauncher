import React, { useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMemory, faFolder, faUndo } from '@fortawesome/free-solid-svg-icons';
import { Slider, Button, Switch } from 'ui';
import logo from '../../../../../../GDLauncher/app/assets/images/logo.png';
import { Input } from '@material-ui/core';

const JavaSettings = styled.div`
  width: 100%;
  height: 500px;
`;

const AutodetectPath = styled.div`
  margin-top: 38px;
  width: 100%;
  height: 120px;
`;

const SelectMemory = styled.div`
  width: 100%;
  height: 120px;
`;

const JavaCustomArguments = styled.div`
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
  width: 300px;
`;

const HR = styled.hr`
  opacity: 0.29;
  background: ${props => props.theme.palette.secondary.light};
`;

const marks = [
  {
    value: 0
  },
  {
    value: 20
  },
  {
    value: 37
  },
  {
    value: 100
  }
];

export default function MyAccountPreferences() {
  const [selectedInputValue, setSelectedInputValue] = useState('');
  return (
    <JavaSettings>
      <h1
        css={`
          float: left;
          margin: 0;
        `}
      >
        Java
      </h1>
      <AutodetectPath>
        <Title
          css={`
            position: absolute;
            top: 80px;
          `}
        >
          Autodetect Java Path&nbsp; <FontAwesomeIcon icon={faFolder} />
        </Title>
        <Paragraph
          css={`
            position: absolute;
            top: 100px;
          `}
        >
          If enable, Java path will be autodetected
        </Paragraph>
        <Switch
          css={`
            position: absolute;
            top: 100px;
            right: 0px;
          `}
          color="primary"
        />
      </AutodetectPath>
      <HR />
      <SelectMemory>
        <Title
          css={`
            position: absolute;
            top: 200px;
          `}
        >
          Java Memory&nbsp; <FontAwesomeIcon icon={faMemory} />
        </Title>
        <Paragraph
          css={`
            position: absolute;
            top: 220px;
          `}
        >
          Select the preferred amount of memory to use when lauching the game
        </Paragraph>
        <Slider
          css={`
            position: absolute;
            top: 280px;
            right: 0;
          `}
          defaultValue={30}
          //   getAriaValueText={valuetext}
          valueLabelDisplay="auto"
          marks={marks}
          min={10}
          max={100}
        />
      </SelectMemory>
      <HR />
      <JavaCustomArguments>
        <Title>Java Custom Arguments</Title>
        <Paragraph
          css={`
            position: absolute;
            top: 360px;
          `}
        >
          Select the preferred amount of memory to use when lauching the game
        </Paragraph>
        <Input
          css={`
            position: absolute;
            top: 420px;
            left: 0;
            width: 80%;
          `}
        />
        <Button
          css={`
            position: absolute;
            top: 430px;
            right: 0px;
          `}
        >
          <FontAwesomeIcon icon={faUndo} />
        </Button>
      </JavaCustomArguments>
    </JavaSettings>
  );
}
