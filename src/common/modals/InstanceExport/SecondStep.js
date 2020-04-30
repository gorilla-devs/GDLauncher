import React, { useEffect, useState } from 'react';
import dirTree from 'directory-tree';
import { Tree } from 'antd';
import path from 'path';
// import { PACKS_PATH } from '../../constants';
import BackButton from './BackButton';
import ContinueButton from './ContinueButton';
// import styles from './ExportPackModal.module.css';

export default function SecondStep({
  instanceName,
  instancesPath,
  selectedFiles,
  setSelectedFiles,
  setPage
}) {
  const [treeData, setTreeData] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [checkedKeys, setCheckedKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  const filesToDisable = [
    path.join(instancesPath, instanceName, 'config.json'),
    path.join(instancesPath, instanceName, 'natives'),
    path.join(instancesPath, instanceName, 'thumbnail.png'),
    path.join(instancesPath, instanceName, 'usercache.json'),
    path.join(instancesPath, instanceName, 'usernamecache.json'),
    path.join(instancesPath, instanceName, 'logs'),
    path.join(instancesPath, instanceName, '.mixin.out'),
    path.join(instancesPath, instanceName, 'screenshots'),
    path.join(instancesPath, instanceName, 'crash-reports')
  ];

  useEffect(() => getTreeData(), []);

  const getTreeData = () => {
    const arr = dirTree(path.join(instancesPath, instanceName));

    const mapArr = children => {
      if (children === undefined || children.length === 0) return [];
      return children.map(child => ({
        title: child.name,
        key: child.path,
        type: child.type,
        children: mapArr(child.children)
      }));
    };

    setTreeData(mapArr(arr.children));
    // console.log(arr);
    // console.log(arr.children);
    // console.log(mapArr(arr.children));
    setCheckedKeys(selectedFiles);
  };

  const onExpand = LexpandedKeys => {
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    setExpandedKeys(LexpandedKeys);
    setAutoExpandParent(false);
  };

  const onCheck = LcheckedKeys => {
    setCheckedKeys(LcheckedKeys);
    setSelectedFiles(LcheckedKeys);
  };

  const onSelect = LselectedKeys => {
    setSelectedKeys(LselectedKeys);
  };

  const renderTreeNodes = (data, disableChildren = false) =>
    data.map(item => {
      if (item.children) {
        return (
          <Tree.TreeNode
            disabled={
              disableChildren ? true : filesToDisable.find(f => item.key === f)
            }
            // checkable={!disableChildren}
            title={item.title}
            key={item.key}
            dataRef={item}
          >
            {renderTreeNodes(
              item.children,
              disableChildren || filesToDisable.find(f => item.key === f)
            )}
          </Tree.TreeNode>
        );
      }
      // eslint-disable-next-line react/jsx-props-no-spreading
      return <Tree.TreeNode {...item} />;
    });

  return (
    <div>
      <h2>What files/folders would you like to export?</h2>
      <div>Only select mods that are not on curseforge.</div>
      <div
        css={`
          overflow-y: auto;
          max-height: 300px;
          border-style: solid;
          border-width: 2px;
          border-color: ${props => props.theme.palette.primary.dark};
        `}
      >
        <Tree
          checkable
          onExpand={onExpand}
          expandedKeys={expandedKeys}
          autoExpandParent={autoExpandParent}
          onCheck={onCheck}
          checkedKeys={checkedKeys}
          onSelect={onSelect}
          selectedKeys={selectedKeys}
        >
          {renderTreeNodes(treeData)}
        </Tree>
      </div>
      <BackButton onClick={setPage} />
      <ContinueButton onClick={setPage} />
    </div>
  );
}
