import React, { useState } from "react";
import fse from "fs-extra";
import path from "path";
import { Button, Progress } from "antd";
import { useSelector, useDispatch } from "react-redux";
import Modal from "../components/Modal";
import { _getInstancesPath } from "../utils/selectors";
import { closeModal } from "../reducers/modals/actions";

const InstanceDeleteConfirmation = ({ instanceName }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const instancesPath = useSelector(_getInstancesPath);
  const deleteInstance = async () => {
    setLoading(true);
    await fse.remove(path.join(instancesPath, instanceName));
    dispatch(closeModal());
  };
  const closeModalWindow = () => dispatch(closeModal());
  return (
    <Modal
      css={`
        height: 40%;
        width: 50%;
        max-width: 550px;
        max-height: 260px;
        overflow-x: hidden;
      `}
      title="Confirm Instance Deletion"
    >
      <div>
        Are you sure you want to delete:
        <h4
          css={`
            font-style: italic;
            font-weight: 100;
            color: ${props => props.theme.palette.error.main};
          `}
        >
          {instanceName}
        </h4>
        This action is permanent and cannot be undone. You will lose all the
        data you have in this instance
        <div
          css={`
            margin-top: 35px;
            display: flex;
            width: 100%;
            justify-content: space-between;
          `}
        >
          <Button
            onClick={closeModalWindow}
            variant="contained"
            color="primary"
          >
            No, Abort
          </Button>
          {loading ? (
            <Progress type="circle" />
          ) : (
            <Button onClick={deleteInstance}>Yes, Delete</Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default InstanceDeleteConfirmation;
