import React, { useEffect, useState } from 'react';
import dirTree from 'directory-tree';
import { Tree } from 'antd';
import path from 'path';
import BackButton from './BackButton';
import ContinueButton from './ContinueButton';

export default function SecondStep({
  instanceName,
  instancesPath,
  setSelectedFiles,
  setPage
}) {
  const [treeData, setTreeData] = useState([]);
  const instancePath = path.join(instancesPath, instanceName);

  const fileBlackList = [
    path.join(instancePath, 'config.json'),
    path.join(instancePath, 'natives'),
    path.join(instancePath, 'thumbnail.png'),
    path.join(instancePath, 'usercache.json'),
    path.join(instancePath, 'usernamecache.json'),
    path.join(instancePath, 'logs'),
    path.join(instancePath, '.mixin.out'),
    path.join(instancePath, 'screenshots'),
    path.join(instancePath, 'crash-reports')
  ];

  useEffect(() => {
    const getTreeData = async () => {
      const arr = dirTree(instancePath);

      const mapArr = (children, disableChildren = false) => {
        if (!children || children.length === 0) return [];
        return children.map(child => {
          const disableBool =
            disableChildren || fileBlackList.some(file => file === child.path);
          return {
            title: child.name,
            key: child.path,
            selectable: false,
            disableCheckbox: disableBool,
            children: mapArr(child.children, disableBool)
          };
        });
      };

      function rootNode(localName, localPath, children = []) {
        return [
          {
            title: localName,
            key: localPath,
            selectable: false,
            expanded: true,
            children
          }
        ];
      }

      await setTreeData(
        rootNode('Root Node', instancePath, mapArr(arr.children))
      );
    };

    getTreeData();
  }, []);

  const onCheck = LcheckedKeys => {
    setSelectedFiles(LcheckedKeys);
  };

  return (
    <div
      css={`
        text-align: center;
      `}
    >
      <h2>Files to include in export</h2>
      <div
        css={`
          overflow-y: auto;
          max-height: 300px;
          border-style: solid;
          border-width: 2px;
          border-color: ${props => props.theme.palette.primary.dark};
        `}
      >
        <Tree checkable selectable onCheck={onCheck} treeData={treeData} />
      </div>
      <BackButton onClick={setPage} />
      <ContinueButton onClick={setPage} />
    </div>
  );
}
