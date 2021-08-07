/* eslint-disable */
import React, { useState, lazy, Suspense } from 'react';
import Modal from '../../components/Modal';
import AsyncComponent from '../../components/AsyncComponent';

const InstanceName = AsyncComponent(lazy(() => import('./InstanceName')));
const Content = AsyncComponent(lazy(() => import('./Content')));

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
      title="Add New Instance"
    >
      <Suspense>
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
      </Suspense>
    </Modal>
  );
};

export default React.memo(AddInstance);
