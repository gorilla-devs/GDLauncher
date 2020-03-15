/* eslint-disable */
import React, { useState } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { Input, Button, Card, Switch } from "antd";

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
`;

const JavaManagerCard = styled(Card)`
  margin-bottom: 20px;
`;

const Overview = () => {
  return (
    <Container>
      <Column>
        <MainTitle>Overview</MainTitle>
        <RenameRow>
          <Input />
          <RenameButton>
            Rename&nbsp;
            <FontAwesomeIcon icon={faSave} />
          </RenameButton>
        </RenameRow>
        <ForgeManagerCard title="Forge Manager" />
        <JavaManagerCard title="Java Manager" />
      </Column>
    </Container>
  );
};

export default Overview;
