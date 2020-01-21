/* eslint-disable no-nested-ternary */
import React from "react";
import path from "path";
import { Button } from "antd";
import styled from "styled-components";

const H2 = styled.h2`
  color: ${props => props.theme.palette.text.primary};
`;

function ContinueButton({ filePath, setActualStep }) {
  if (filePath === null) return null;
  return (
    <Button
      css={`
        position: absolute;
        bottom: 10px;
        right: 10px;
      `}
      type="primary"
      onClick={() => setActualStep(s => s + 1)}
    >
      Continue
    </Button>
  );
}

export default function FirstStep({ filePath, setActualStep, showFileDialog }) {
  return (
    <div
      css={`
        height: 85%;
        width: 100%;
        padding: 20px;
        overflow-y: no-scroll;
      `}
    >
      <div
        css={`
          display: flex;
          justify-content: center;
          width: 100%;
          height: 100%;
          align-items: center;
          text-align: center;
        `}
      >
        <div>
          <H2
            css={`
              color: white;
            `}
          >
            Where do you want to save the exported zip pack?
          </H2>
          <Button
            type="primary"
            onClick={showFileDialog}
            css={`
              margin-top: 80px;
              min-width: 130px;
            `}
          >
            {filePath === null
              ? "Select Folder"
              : path.basename(filePath).length >= 24
              ? `${path.basename(filePath).substr(0, 24)}...`
              : path.basename(filePath)}
          </Button>
        </div>
      </div>
      <ContinueButton filePath={filePath} setActualStep={setActualStep} />
    </div>
  );
}
