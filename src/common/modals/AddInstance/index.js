/* eslint-disable */
import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Checkbox, TextField, Cascader, Button, Input } from 'antd';
import Modal from '../../components/Modal';
import i18n from '../../config/i18next';

import InstanceName from './InstanceName';

import Content from './Content';

const AddInstance = ({ defaultPage }) => {
  const [version, setVersion] = useState(null);
  const [step, setStep] = useState(0);
  const [modpack, setModpack] = useState(null);
  const [importZipPath, setImportZipPath] = useState('');
  const [page, setPage] = useState(defaultPage);

  return (
    <Modal
      css={`
        height: 85%;
        width: 80%;
        max-width: 1000px;
        overflow: hidden;
      `}
      title={i18n.t('add_instance:add_new_instance')}
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
        setImportZipPath={setImportZipPath}
        importZipPath={importZipPath}
      />
      <InstanceName
        version={version}
        in={step === 1}
        setStep={setStep}
        modpack={modpack}
        setVersion={setVersion}
        setModpack={setModpack}
        importZipPath={importZipPath}
        step={step}
      />
    </Modal>
  );
};

export default React.memo(AddInstance);
