import React, { useEffect, useState } from 'react';
import dirTree from 'directory-tree';
import { Tree } from 'antd';
import path from 'path';
import { PACKS_PATH } from '../../constants';
import BackButton from './BackButton';
import ContinueButton from './ContinueButton';
import styles from './ExportPackModal.scss';

export default function SecondStep(props) {
  const [treeData, setTreeData] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [checkedKeys, setCheckedKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  const filesToDisable = [
    path.join(PACKS_PATH, props.instanceName, 'config.json'),
    path.join(PACKS_PATH, props.instanceName, 'natives'),
    path.join(PACKS_PATH, props.instanceName, 'thumbnail.png'),
    path.join(PACKS_PATH, props.instanceName, 'usercache.json'),
    path.join(PACKS_PATH, props.instanceName, 'usernamecache.json')
  ];

  useEffect(() => getTreeData(), []);

  const getTreeData = () => {
    const arr = dirTree(path.join(PACKS_PATH, props.instanceName));

    const mapArr = children => {
      if (children === undefined || children.length === 0) return [];
      return children.map(child => ({
        title: child.name,
        key: child.path,
        children: mapArr(child.children)
      }));
    };

    setTreeData(mapArr(arr.children));
    setCheckedKeys(props.selectedFiles);
  };

  const onExpand = LexpandedKeys => {
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    setExpandedKeys(LexpandedKeys);
    setAutoExpandParent(false);
  };

  const onCheck = LcheckedKeys => {
    setCheckedKeys(LcheckedKeys);
    props.setSelectedFiles(LcheckedKeys);
  };

  const onSelect = (LselectedKeys, info) => {
    setSelectedKeys(LselectedKeys);
  };

  const renderTreeNodes = data =>
    data.map(item => {
      if (item.children) {
        return (
          <Tree.TreeNode
            disabled={filesToDisable.find(f => item.key === f)}
            title={item.title}
            key={item.key}
            dataRef={item}
          >
            {renderTreeNodes(item.children)}
          </Tree.TreeNode>
        );
      }
      return <Tree.TreeNode {...item} />;
    });

  return (
    <div className={styles.container}>
      <h2>What files/folders would you like to export?</h2>
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
      <ContinueButton
        filePath={props.filePath}
        setActualStep={props.setActualStep}
      />
      <BackButton setActualStep={props.setActualStep} />
    </div>
  );
}
