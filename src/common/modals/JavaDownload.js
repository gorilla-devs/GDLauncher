import React from "react";
import { useSelector } from "react-redux";
import { Progress } from "antd";
import Modal from "../components/Modal";

const JavaDownload = () => {
  const progress = useSelector(state => state.javaDownloadStatus);
  return (
    <Modal
      css={`
        height: 40%;
        width: 30%;
        max-width: 300px;
        max-height: 320px;
      `}
      title="Java Updater"
    >
      <div
        css={`
          display: flex;
          justify-content: center;
          width: 100%;
        `}
      >
        <div>
          <h1>Updating Java</h1>
          <h3>Hold on...</h3>
          <Progress
            css={`
              margin-top: 70px;
            `}
            percent={progress}
          />
        </div>
      </div>
    </Modal>
  );
};

export default JavaDownload;
