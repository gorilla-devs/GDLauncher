import React, { useEffect, useState } from "react";
import dirTree from "directory-tree";
import { Tree, Button } from "antd";
import path from "path";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { _getInstancesPath } from "../../utils/selectors";

const H2 = styled.h2`
  color: ${props => props.theme.palette.text.primary};
`;

function BackButton({ setActualStep }) {
  return (
    <Button
      css={`
        position: absolute;
        bottom: 10px;
        left: 10px;
      `}
      type="primary"
      onClick={() => setActualStep(s => s - 1)}
    >
      Back
    </Button>
  );
}

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

export default function SecondStep({
  instanceName,
  selectedFiles,
  filePath,
  setActualStep,
  setSelectedFiles
}) {
  const [treeData, setTreeData] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [checkedKeys, setCheckedKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const instancePath = useSelector(_getInstancesPath);
  const packsPath = path.join(instancePath, "packs");

  const filesToDisable = [
    path.join(packsPath, instanceName, "config.json"),
    path.join(packsPath, instanceName, "natives"),
    path.join(packsPath, instanceName, "thumbnail.png"),
    path.join(packsPath, instanceName, "usercache.json"),
    path.join(packsPath, instanceName, "usernamecache.json")
  ];

  useEffect(
    () => () => {
      getTreeData();
    },
    []
  );

  const getTreeData = async () => {
    const arr = await dirTree(packsPath);
    console.log("ciao", arr, path.join(packsPath, instanceName));

    const mapArr = children => {
      console.log("children", children, packsPath);
      if (children === undefined || children.length === 0) return [];
      return children.map(child => ({
        title: child.name,
        key: child.path,
        children: mapArr(child.children)
      }));
    };

    setTreeData(mapArr(arr.path));
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

  // eslint-disable-next-line no-unused-vars
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
      // eslint-disable-next-line react/jsx-props-no-spreading
      return <Tree.TreeNode {...item} />;
    });

  return (
    <div
      css={`
        height: 85%;
        width: 100%;
        padding: 20px;
        overflow-y: auto;
      `}
    >
      <H2>What files/folders would you like to export?</H2>
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
      <ContinueButton filePath={filePath} setActualStep={setActualStep} />
      <BackButton setActualStep={setActualStep} />
    </div>
  );
}
