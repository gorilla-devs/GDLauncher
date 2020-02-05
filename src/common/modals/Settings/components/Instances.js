import React, { useState } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import fsa from "fs-extra";
import path from "path";
import { ipcRenderer } from "electron";
import { Button, Input, Switch } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faFolder,
  faLevelDownAlt
} from "@fortawesome/free-solid-svg-icons";
import { _getInstancesPath } from "../../../utils/selectors";
import { updateInstancesPath } from "../../../reducers/settings/actions";

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
  height: 70px;
`;

const InstanceCustomPath = styled.div`
  width: 100%;
  height: 40px;
`;

const Title = styled.h3`
  position: absolute;
  font-size: 15px;
  font-weight: 700;
  color: ${props => props.theme.palette.text.primary};
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

const H1 = styled.h1`
  color: ${props => props.theme.palette.text.primary};
`;

const StyledButtons = styled(Button)``;

async function clearSharedData(InstancesPath, setDeletingInstances) {
  setDeletingInstances(true);
  try {
    setDeletingInstances(true);
    await fsa.emptyDir(path.join(InstancesPath, "temp"));
    await fsa.emptyDir(path.join(InstancesPath, "datastore"));
    await fsa.emptyDir(path.join(InstancesPath, "instances"));
    setDeletingInstances(false);
  } catch (e) {
    console.log(e);
  }
}

const openFolderDialog = async (
  InstancesPath,
  dispatch,
  updateInstancesPath
) => {
  const paths = await ipcRenderer.invoke(
    "openFolderDialog",
    InstancesPath,
    updateInstancesPath
  );
  dispatch(updateInstancesPath(paths[0]));
};

export default function MyAccountPreferences() {
  const [deletingInstances, setDeletingInstances] = useState(false);
  const [overrideInstancesPath, setOverrideInstancesPath] = useState(false);
  const InstancesPath = useSelector(_getInstancesPath);
  const InstancesP = useSelector(state => state.settings.instancesPath);
  const dispatch = useDispatch();

  return (
    <Instances>
      <H1
        css={`
          float: left;
          margin: 0;
        `}
      >
        Instances
      </H1>
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
        {deletingInstances ? (
          <StyledButtons
            onClick={() => clearSharedData(InstancesPath, setDeletingInstances)}
            disabled
            css={`
              margin-top: 70px;
              float: right;
            `}
            color="primary"
          >
            Clear
          </StyledButtons>
        ) : (
          <StyledButtons
            onClick={() => clearSharedData(InstancesPath, setDeletingInstances)}
            css={`
              margin-top: 70px;
              float: right;
            `}
            color="primary"
          >
            Clear
          </StyledButtons>
        )}
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
          style={{
            float: "right",
            marginTop: "20px"
          }}
          color="primary"
          onChange={e => setOverrideInstancesPath(e)}
          checked={overrideInstancesPath}
        />
      </OverridePath>
      {overrideInstancesPath && (
        <InstanceCustomPath>
          <div
            css={`
              margin-top: 20px;
              width: 100%;
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
                margin-right: 10px;
                margin-left: 10px;
              `}
              onChange={e => dispatch(updateInstancesPath(e.target.value))}
              value={InstancesP || InstancesPath}
            />
            <StyledButtons
              color="primary"
              onClick={() =>
                openFolderDialog(InstancesPath, dispatch, updateInstancesPath)
              }
            >
              <FontAwesomeIcon icon={faFolder} />
            </StyledButtons>
          </div>
        </InstanceCustomPath>
      )}
    </Instances>
  );
}
