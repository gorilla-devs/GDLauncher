/* eslint-disable */
import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { Checkbox, TextField, Cascader, Button, Input } from "antd";
import Modal from "../../components/Modal";

import InstanceName from "./InstanceName";

import Content from "./Content";

const AddInstance = () => {
  const [page, setPage] = useState(0);
  const [version, setVersion] = useState(null);
  const [step, setStep] = useState(0);
  const [modpack, setModpack] = useState(null);
  const [isImport, setIsImport] = useState(null);

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
        version={version}
        setModpack={setModpack}
        modpack={modpack}
        setIsImport={setIsImport}
      />
      <InstanceName
        version={version}
        in={step === 1}
        setStep={setStep}
        modpack={modpack}
        setVersion={setVersion}
        setModpack={setModpack}
        isImport={isImport}
      />
    </Modal>
  );
};

export default React.memo(AddInstance);
