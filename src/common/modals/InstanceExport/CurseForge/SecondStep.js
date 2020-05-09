import React from 'react';
import { Tree } from 'antd';
import BackButton from './BackButton';
import ContinueButton from './ContinueButton';

export default function SecondStep({
  setSelectedFiles,
  setPage,
  treeData,
  instancePath,
  selectedFiles
}) {
  const onCheck = LcheckedKeys => {
    setSelectedFiles(LcheckedKeys);
  };

  return (
    <div
      css={`
        text-align: center;
        height: calc(100% - 40px);
      `}
    >
      <h2>Files to include in export</h2>
      <div
        css={`
          overflow-y: auto;
          height: calc(100% - 45px);
          border-style: solid;
          border-width: 2px;
          border-color: ${props => props.theme.palette.primary.dark};
          background-color: ${props => props.theme.palette.grey[800]};
        `}
      >
        <Tree
          checkable
          selectable
          onCheck={onCheck}
          treeData={treeData}
          defaultExpandedKeys={[instancePath]}
          defaultCheckedKeys={selectedFiles}
        />
      </div>
      <BackButton onClick={setPage} />
      <ContinueButton onClick={setPage} />
    </div>
  );
}
