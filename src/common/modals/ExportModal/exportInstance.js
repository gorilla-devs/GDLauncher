/* eslint-disable no-unused-vars */
import { remote } from "electron";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { _getInstances } from "../../utils/selectors";
import Modal from "../../components/Modal";
import FirstStep from "./FirstStep";
import SecondStep from "./SecondStep";
import ThirdStep from "./ThirdStep";

export default function ExportPack({ instanceName }) {
  const [unMount, setUnMount] = useState(false);
  const [filePath, setFilePath] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [actualStep, setActualStep] = useState(0);

  const showFileDialog = async () => {
    const dialog = await remote.dialog.showOpenDialog({
      properties: ["openDirectory"]
    });
    setFilePath(dialog.filePaths[0]);
  };

  useEffect(() => {
    console.log(instanceName, filePath);
  }, [filePath]);

  return (
    <Modal
      title="Export Pack"
      css={`
        height: 400px;
        width: 540px;
      `}
    >
      {actualStep === 0 && (
        <FirstStep
          filePath={filePath}
          showFileDialog={showFileDialog}
          setActualStep={setActualStep}
        />
      )}
      {actualStep === 1 && (
        <SecondStep
          filePath={filePath}
          setActualStep={setActualStep}
          instanceName={instanceName}
          setSelectedFiles={setSelectedFiles}
          selectedFiles={selectedFiles}
        />
      )}
      {actualStep === 2 && (
        <ThirdStep
          filePath={filePath}
          setActualStep={setActualStep}
          instanceName={instanceName}
          selectedFiles={selectedFiles}
          setUnMount={setUnMount}
        />
      )}
    </Modal>
  );
}
