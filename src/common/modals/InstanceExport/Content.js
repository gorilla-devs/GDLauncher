import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { Transition } from 'react-transition-group';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import {
//   faLongArrowAltLeft,
//   faLongArrowAltRight
// } from '@fortawesome/free-solid-svg-icons';
// import { LoadingOutlined } from '@ant-design/icons';
// import { transparentize } from 'polished';
// import { Input, Spin } from 'antd';
import { ipcRenderer } from 'electron';
// import path from 'path';
import FirstStep from './FirstStep';
import SecondStep from './SecondStep';
import ThirdStep from './ThirdStep';
import {
  _getInstancesPath,
  _getTempPath,
  _getCurrentAccount
} from '../../utils/selectors';

const Content = ({
  // inProp,
  instanceName,
  // step,
  // setStep,
  page,
  setPage,
  // setVersion,
  // version,
  // setModpack,
  // importZipPath,
  // setImportZipPath,
  instanceConfig,
  closeModal
}) => {
  const currentAccount = useSelector(_getCurrentAccount);
  const username = currentAccount.selectedProfile.name;
  const [filePath, setFilePath] = useState(null);
  const [packVersion, setPackVersion] = useState('0.1.0');
  const [packAuthor, setPackAuthor] = useState(username);
  const [packZipName, setPackZipName] = useState(instanceName);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const instancesPath = useSelector(_getInstancesPath);
  const tempPath = useSelector(_getTempPath);

  const openFolderDialog = async () => {
    const dialog = await ipcRenderer.invoke('openFolderDialog', instancesPath);
    if (dialog.canceled) return;
    setFilePath(dialog.filePaths[0]);
  };

  const pages = [
    <FirstStep
      setPackZipName={setPackZipName}
      packZipName={packZipName}
      filePath={filePath}
      showFileDialog={openFolderDialog}
      // actualStep={step}
      // setActualStep={setStep}
      setPackVersion={setPackVersion}
      packVersion={packVersion}
      packAuthor={packAuthor}
      setPackAuthor={setPackAuthor}
      setPage={setPage}
      page={page}
    />,
    <SecondStep
      filePath={filePath}
      instanceName={instanceName}
      setSelectedFiles={setSelectedFiles}
      selectedFiles={selectedFiles}
      instancesPath={instancesPath}
      setPage={setPage}
    />,
    <ThirdStep
      packZipName={packZipName}
      filePath={filePath}
      instanceName={instanceName}
      instanceConfig={instanceConfig}
      selectedFiles={selectedFiles}
      closeModal={closeModal}
      packVersion={packVersion}
      tempPath={tempPath}
      packAuthor={packAuthor}
      instancesPath={instancesPath}
    />
  ];

  return (
    <Transition in="true" timeout={200}>
      {state => (
        <Animation state={state}>
          <div
            css={`
              width: 100%;
              height: calc(100% - 40px);
              display: flex;
              margin: 20px;
            `}
          >
            <div
              css={`
                flex: 5;
                height: 100%;
              `}
            >
              {pages[page]}
            </div>
          </div>
        </Animation>
      )}
    </Transition>
  );
};

export default React.memo(Content);

const Animation = styled.div`
  transition: 0.2s ease-in-out;
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 100000;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  will-change: transform;
  transform: translateX(
    ${({ state }) => (state === 'exiting' || state === 'exited' ? -100 : 0)}%
  );
`;
