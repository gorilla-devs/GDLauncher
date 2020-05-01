import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { _getInstance } from '../../utils/selectors';
import Modal from '../../components/Modal';
import { closeModal } from '../../reducers/modals/actions';
import Content from './Content';

const InstanceExport = ({ instanceName }) => {
  const [version, setVersion] = useState(null);
  const [modpack, setModpack] = useState(null);
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
        page={page}
        setPage={setPage}
        setVersion={setVersion}
        version={version}
        setModpack={setModpack}
        modpack={modpack}
        closeModal={closeModal}
        instanceName={instanceName}
        instanceConfig={instanceConfig}
      />
    </Modal>
  );
};

export default React.memo(InstanceExport);
