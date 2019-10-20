import React from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faFolder } from "@fortawesome/free-solid-svg-icons";
import { Button, Switch, Input } from "../../../../ui";

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

const Hr = styled.hr`
  opacity: 0.29;
  background: ${props => props.theme.palette.secondary.light};
`;

const StyledButtons = styled(Button)``;

export default function MyAccountPreferences() {
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
        <StyledButtons
          css={`
            position: absolute;
            top: 110px;
            right: 0px;
          `}
          color="primary"
        >
          Clear
        </StyledButtons>
      </AutodetectPath>
      <Hr />
      <OverridePath>
        <Title
          css={`
            position: absolute;
            top: 180px;
          `}
        >
          Override Default Instance Path&nbsp;{" "}
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
          style={{ position: "absolute", top: "220px", right: 0 }}
          color="primary"
        />
      </OverridePath>
      <Hr />
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
          style={{
            position: "absolute",
            top: "400px",
            left: 0,
            width: "80%"
          }}
        />
        <StyledButtons
          css={`
            position: absolute;
            top: 400px;
            right: 0px;
          `}
          color="primary"
        >
          <FontAwesomeIcon icon={faFolder} />
        </StyledButtons>
      </InstanceCustomPath>
    </Instances>
  );
}
