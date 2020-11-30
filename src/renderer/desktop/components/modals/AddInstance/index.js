/* eslint-disable */
import React, { useState, useMemo } from 'react';
import InstanceName from './InstanceName';
import Content from './Content';
import ModalWindow from 'src/renderer/common/components/ModalWindow';

const AddInstance = ({ defaultPage }) => {
  const [installData, setInstallData] = useState({});
  const [step, setStep] = useState(0);
  const [page, setPage] = useState(defaultPage);

  return (
    <ModalWindow
      css={`
        height: 85%;
        width: 80%;
        max-width: 1000px;
        overflow: hidden;
      `}
      title="Add New Instance"
    >
      <Content
        in={step === 0}
        page={page}
        setPage={setPage}
        setStep={setStep}
      />
      <InstanceName in={step === 1} setStep={setStep} />
    </ModalWindow>
  );
};

export default React.memo(AddInstance);
