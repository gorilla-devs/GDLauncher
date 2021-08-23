import React, { useEffect } from 'react';
import dirTree from 'directory-tree';
import path from 'path';
import { Button, Input } from 'antd';
import { Transition } from 'react-transition-group';
import styled from 'styled-components';
import { faFolder } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ContinueButton from './ContinueButton';

const InlineBlock = styled.span`
  display: inline-block;
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
  page,
  packAuthor,
  setPackAuthor,
  packZipName,
  setPackZipName,
  setSelectedFiles,
  inProp
}) {
  const fileBlackList = [
    path.join(instancePath, 'config.json'),
    path.join(instancePath, 'natives'),
    path.join(instancePath, 'thumbnail.png'),
    path.join(instancePath, 'usercache.json'),
    path.join(instancePath, 'usernamecache.json'),
    path.join(instancePath, 'logs'),
    path.join(instancePath, '.mixin.out'),
    path.join(instancePath, '.fabric'),
    path.join(instancePath, 'screenshots'),
    path.join(instancePath, 'crash-reports'),
    path.join(instancePath, 'manifest.json')
  ];

  useEffect(() => {
    if (page !== 1) return;
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
  }, [page]);

  function filePathDisplay() {
    if (!filePath) return '';
    let fileName = `${packZipName}-${packVersion}.zip`;
    if (fileName.length >= 25)
      fileName = `...${fileName.slice(fileName.length - 25)}`;
    const joinedPath = path.join(filePath, fileName);

    if (joinedPath.length >= 45)
      return `...${joinedPath.slice(joinedPath.length - 45)}`;
    return joinedPath;
  }

  return (
    <Transition in={inProp} timeout={200}>
      {state => (
        <Animation state={state}>
          <div
            css={`
              width: 100%;
              height: 100%;
              display: flex;
              margin-top: 40px;
            `}
          >
            <div
              css={`
                flex: 5;
                height: 100%;
              `}
            >
              <div
                css={`
                  height: 85%;
                  width: 100%;
                  overflow-y: auto;
                `}
              >
                <div
                  css={`
                    display: flex;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                    text-align: center;
                  `}
                >
                  <div
                    css={`
                      width: calc(100% - 40px);
                    `}
                  >
                    <div
                      css={`
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 10px;
                      `}
                    >
                      <InlineBlock>
                        <h3>Name</h3>
                      </InlineBlock>
                      <span>
                        <Input
                          type="text"
                          name="inputPackAuthor"
                          allowClear="true"
                          defaultValue={packZipName}
                          maxLength={50}
                          css={`
                            width: 300px !important;
                          `}
                          onChange={e => setPackZipName(e.target.value)}
                        />
                      </span>
                    </div>
                    <div
                      css={`
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 10px;
                      `}
                    >
                      <InlineBlock>
                        <h3>Version</h3>
                      </InlineBlock>
                      <span>
                        <Input
                          type="text"
                          name="inputPackVersion"
                          defaultValue={packVersion}
                          maxLength={10}
                          allowClear="true"
                          css={`
                            width: 300px !important;
                          `}
                          onChange={e => setPackVersion(e.target.value)}
                        />
                      </span>
                    </div>
                    <div
                      css={`
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 40px;
                      `}
                    >
                      <InlineBlock>
                        <h3>Author</h3>
                      </InlineBlock>
                      <span
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
                            width: 300px !important;
                          `}
                          onChange={e => setPackAuthor(e.target.value)}
                        />
                      </span>
                    </div>
                    <div
                      css={`
                        display: flex;
                        justify-content: space-between;
                      `}
                    >
                      <Input
                        type="text"
                        name="filePathDisplay"
                        disabled
                        value={filePathDisplay()}
                        css={`
                          margin-right: 10px !important;
                        `}
                      />
                      <Button type="primary" onClick={showFileDialog}>
                        <FontAwesomeIcon icon={faFolder} />
                      </Button>
                    </div>
                  </div>
                </div>
                <ContinueButton
                  onClick={setPage}
                  disabled={
                    !(packZipName && packVersion && packAuthor && filePath)
                  }
                />
              </div>
            </div>
          </div>
        </Animation>
      )}
    </Transition>
  );
}

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
