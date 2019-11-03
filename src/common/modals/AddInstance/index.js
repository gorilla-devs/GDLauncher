/* eslint-disable */
import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import { Checkbox, TextField, Cascader, Button, Input } from "antd";
import Modal from "../../components/Modal";
import { addToQueue } from "../../reducers/actions";
import { closeModal } from "../../reducers/modals/actions";
import InstanceName from "./InstanceName";

import Content from "./Content";

const AddInstance = () => {
  // 0 -> default
  // 1 -> twitch modpacks
  // 2 -> import
  const [page, setPage] = useState(0);
  const [version, setVersion] = useState(null);
  const [instanceName, setInstanceName] = useState("");
  const [step, setStep] = useState(0);
  const dispatch = useDispatch();
  const fabricManifest = useSelector(state => state.app.fabricManifest);

  const createInstance = () => {
    if (!version || !instanceName) return;
    const isVanilla = version[0] === "vanilla";
    const isFabric = version[0] === "fabric";
    const isForge = version[0] === "forge";
    if (isVanilla) {
      dispatch(addToQueue(instanceName, version[2]));
    } else if (isFabric) {
      const mappedItem = fabricManifest.mappings.find(
        v => v.version === version[2]
      );
      const splitItem = version[2].split(mappedItem.separator);
      dispatch(
        addToQueue(instanceName, splitItem[0], [
          "fabric",
          version[2],
          version[3]
        ])
      );
    } else if (isForge) {
      dispatch(addToQueue(instanceName, version[1], version));
    }
    dispatch(closeModal());
  };

  return (
    <Modal
      css={`
        height: 85%;
        width: 85%;
        max-width: 1500px;
      `}
      title="Add New Instance"
    >
      <Content
        in={step === 0}
        page={page}
        setPage={setPage}
        setStep={setStep}
        setVersion={setVersion}
      />
      <InstanceName in={step === 1} setStep={setStep} />
    </Modal>
  );
};

export default React.memo(AddInstance);
