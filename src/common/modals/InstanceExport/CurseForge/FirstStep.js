import React, { useEffect } from 'react';
import dirTree from 'directory-tree';
import path from 'path';
import { Button, Input } from 'antd';
import styled from 'styled-components';
import ContinueButton from './ContinueButton';

const InlineBlock = styled.span`
  display: inline-block;
  margin-left: 10px;
  margin-right: 10px;
`;

export default function FirstStep({
  instancePath,
  setTreeData,
  filePath,
  showFileDialog,
  setPackVersion,
  packVersion,
  setPage,
  packAuthor,
  setPackAuthor,
  packZipName,
  setPackZipName,
  setSelectedFiles
}) {
  const fileBlackList = [
    path.join(instancePath, 'config.json'),
    path.join(instancePath, 'natives'),
    path.join(instancePath, 'thumbnail.png'),
    path.join(instancePath, 'usercache.json'),
    path.join(instancePath, 'usernamecache.json'),
    path.join(instancePath, 'logs'),
    path.join(instancePath, '.mixin.out'),
    path.join(instancePath, 'screenshots'),
    path.join(instancePath, 'crash-reports'),
    path.join(instancePath, 'manifest.json')
  ];

  useEffect(() => {
    const getTreeData = async () => {
      const arr = dirTree(instancePath);

      const flatDirArray = objectIn => {
        const arrayResult = [];
        function innerObjectLoop(innerObject) {
          if (!innerObject || innerObject.length === 0) return;
          // eslint-disable-next-line array-callback-return
          innerObject.map(child => {
            if (fileBlackList.some(file => file === child.path)) return;
            arrayResult.push(child.path);
            innerObjectLoop(child.children);
          });
        }
        if (!objectIn || objectIn.length === 0) return arrayResult;
        innerObjectLoop(objectIn);
        return arrayResult;
      };

      const mapObject = (children, disableChildren = false) => {
        if (!children || children.length === 0) return [];
        const files = [];
        const dirs = [];
        // eslint-disable-next-line array-callback-return
        children.map(child => {
          const disableBool =
            disableChildren || fileBlackList.some(file => file === child.path);
          const childResult = {
            title: child.name,
            key: child.path,
            selectable: false,
            disableCheckbox: disableBool,
            children: mapObject(child.children, disableBool)
          };
          if (child.type === 'file') files.push(childResult);
          if (child.type === 'directory') dirs.push(childResult);
        });

        function arrSort(innerArrayToSort) {
          return innerArrayToSort
            .map((el, i) => {
              return { index: i, value: el.title.toLowerCase() };
            })
            .sort((a, b) => {
              if (a.value > b.value) {
                return 1;
              }
              if (a.value < b.value) {
                return -1;
              }
              return 0;
            })
            .map(el => {
              return innerArrayToSort[el.index];
            });
        }
        return arrSort(dirs).concat(arrSort(files));
      };

      // const mapArr = (children, disableChildren = false) => {
      //   if (!children || children.length === 0) return [];
      //   return children.map(child => {
      //     const disableBool =
      //       disableChildren || fileBlackList.some(file => file === child.path);
      //     return {
      //       title: child.name,
      //       key: child.path,
      //       selectable: false,
      //       disableCheckbox: disableBool,
      //       children: mapArr(child.children, disableBool)
      //     };
      //   });
      // };

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
        rootNode('Instance content', instancePath, mapObject(arr.children))
      );
      await setSelectedFiles(flatDirArray(arr.children));
    };

    getTreeData();
  }, []);

  return (
    <div
      css={`
        height: 85%;
        width: 100%;
        padding: 20px;
        overflow-y: auto;
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
        <div
          css={`
            text-align: center;
          `}
        >
          <div>
            <div
              css={`
                text-align: right;
              `}
            >
              <div>
                <InlineBlock>
                  <h3>Name</h3>
                </InlineBlock>
                <InlineBlock>
                  <Input
                    type="text"
                    name="inputPackAuthor"
                    allowClear="true"
                    defaultValue={packZipName}
                    maxLength={50}
                    css={`
                      width: 250px;
                    `}
                    onChange={e => setPackZipName(e.target.value)}
                  />
                </InlineBlock>
              </div>
              <div>
                <InlineBlock>
                  <h3>Version</h3>
                </InlineBlock>
                <InlineBlock>
                  <Input
                    type="text"
                    name="inputPackVersion"
                    defaultValue={packVersion}
                    maxLength={50}
                    allowClear="true"
                    css={`
                      width: 250px;
                    `}
                    onChange={e => setPackVersion(e.target.value)}
                  />
                </InlineBlock>
              </div>
              <div>
                <InlineBlock>
                  <h3>Author</h3>
                </InlineBlock>
                <InlineBlock
                  css={`
                    display: inline-block;
                  `}
                >
                  <Input
                    type="text"
                    name="inputPackAuthor"
                    defaultValue={packAuthor}
                    maxLength={50}
                    allowClear="true"
                    css={`
                      width: 250px;
                    `}
                    onChange={e => setPackAuthor(e.target.value)}
                  />
                </InlineBlock>
              </div>
            </div>
          </div>
          <div>
            <Input
              type="text"
              name="fileNameDisplay"
              disabled
              value={
                packZipName && packVersion
                  ? `${packZipName}-${packVersion}.zip`
                  : 'Invalid'
              }
              css={`
                width: 400px;
                margin-top: 15px;
              `}
            />
          </div>
          <Input
            type="text"
            name="filePathDisplay"
            disabled
            value={
              // eslint-disable-next-line no-nested-ternary
              !filePath
                ? ''
                : filePath.length >= 80
                ? `...${filePath.slice(-80)}`
                : filePath
            }
            css={`
              position: absolute;
              bottom: 70px;
              left: calc(50% - 300px);
              width: 600px;
            `}
          />
          <Button
            type="primary"
            onClick={showFileDialog}
            css={`
              position: absolute;
              bottom: 30px;
              left: calc(50% - 60px);
              width: 120px;
            `}
          >
            Select Folder
          </Button>
        </div>
      </div>
      <ContinueButton
        onClick={setPage}
        disabled={!(packZipName && packVersion && packAuthor && filePath)}
      />
    </div>
  );
}
