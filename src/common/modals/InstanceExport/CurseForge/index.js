import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import path from 'path';
import {
  _getInstance,
  _getCurrentAccount,
  _getInstancesPath,
  _getTempPath
} from '../../../utils/selectors';
import Modal from '../../../components/Modal';
import { closeModal } from '../../../reducers/modals/actions';
import FirstStep from './FirstStep';
import SecondStep from './SecondStep';
import ThirdStep from './ThirdStep';
import sendMessage from '../../../utils/sendMessage';
import EV from '../../../messageEvents';

const InstanceExportCurseForge = ({ instanceName }) => {
  const [page, setPage] = useState(0);
  const instanceConfig = useSelector(state =>
    _getInstance(state)(instanceName)
  );

  const currentAccount = useSelector(_getCurrentAccount);
  const username = currentAccount.selectedProfile.name;
  const [filePath, setFilePath] = useState(null);
  const [packVersion, setPackVersion] = useState('1.0');
  const [packAuthor, setPackAuthor] = useState(username);
  const [packZipName, setPackZipName] = useState(instanceName);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const instancesPath = useSelector(_getInstancesPath);
  const tempPath = useSelector(_getTempPath);
  const [treeData, setTreeData] = useState([]);
  const instancePath = path.join(instancesPath, instanceName);

  const openFolderDialog = async () => {
    const dialog = await sendMessage(EV.OPEN_FOLDER_DIALOG, instancesPath);
    if (dialog.canceled) return;
    setFilePath(dialog.filePaths[0]);
  };

  return (
    <Modal
      css={`
        height: 400px;
        width: 500px;
        overflow: hidden;
        vertial-align: middle;
      `}
      title="Export Instance"
    >
      <FirstStep
        setPackZipName={setPackZipName}
        packZipName={packZipName}
        filePath={filePath}
        showFileDialog={openFolderDialog}
        setPackVersion={setPackVersion}
        packVersion={packVersion}
        packAuthor={packAuthor}
        setPackAuthor={setPackAuthor}
        setPage={setPage}
        page={page}
        instancePath={instancePath}
        setTreeData={setTreeData}
        treeData={treeData}
        setSelectedFiles={setSelectedFiles}
        selectedFiles={selectedFiles}
        inProp={page === 0}
      />
      <SecondStep
        treeData={treeData}
        setSelectedFiles={setSelectedFiles}
        selectedFiles={selectedFiles}
        setPage={setPage}
        page={page}
        instancePath={instancePath}
        inProp={page === 1}
      />
      <ThirdStep
        packZipName={packZipName}
        filePath={filePath}
        page={page}
        instanceName={instanceName}
        instanceConfig={instanceConfig}
        selectedFiles={selectedFiles}
        closeModal={closeModal}
        packVersion={packVersion}
        tempPath={tempPath}
        packAuthor={packAuthor}
        instancesPath={instancesPath}
        inProp={page === 2}
      />
    </Modal>
  );
};

export default React.memo(InstanceExportCurseForge);
