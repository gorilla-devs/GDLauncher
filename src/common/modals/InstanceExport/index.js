import React, { useState } from 'react';
import { useSelector } from 'react-redux';
// import styled from 'styled-components';
// import { Checkbox, TextField, Cascader, Button, Input } from 'antd';
import { _getInstance } from '../../utils/selectors';
import Modal from '../../components/Modal';
import { closeModal } from '../../reducers/modals/actions';
import Content from './Content';

const InstanceExport = ({ instanceName }) => {
  const [version, setVersion] = useState(null);
  // const [step, setStep] = useState(0);
  const [modpack, setModpack] = useState(null);
  // const [importZipPath, setImportZipPath] = useState('');
  const [page, setPage] = useState(0);
  const instanceConfig = useSelector(state =>
    _getInstance(state)(instanceName)
  );

  return (
    <Modal
      css={`
        height: 85%;
        width: 80%;
        max-width: 1000px;
        overflow: hidden;
        vertial-align: middle;
      `}
      title="Export Instance"
    >
      <Content
        // inProp={step === 0}
        page={page}
        setPage={setPage}
        // setStep={setStep}
        setVersion={setVersion}
        version={version}
        setModpack={setModpack}
        modpack={modpack}
        closeModal={closeModal}
        // setImportZipPath={setImportZipPath}
        // importZipPath={importZipPath}
        instanceName={instanceName}
        instanceConfig={instanceConfig}
      />
    </Modal>
  );
};

export default React.memo(InstanceExport);
