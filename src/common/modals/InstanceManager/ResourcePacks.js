/* eslint-disable */
import React, { memo, useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import memoize from 'memoize-one';
import path from 'path';
import { promises as fs, watch } from 'fs';
import makeDir from 'make-dir';
import { ipcRenderer } from 'electron';
import { FixedSizeList as List, areEqual } from 'react-window';
import { Checkbox, Button, Switch } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useSelector, useDispatch } from 'react-redux';
import AutoSizer from 'react-virtualized-auto-sizer';
import { faTwitch } from '@fortawesome/free-brands-svg-icons';
import fse from 'fs-extra';
import { _getInstance, _getInstancesPath } from '../../utils/selectors';
import DragnDropEffect from '../../../ui/DragnDropEffect';

const Header = styled.div`
  height: 40px;
  width: 100%;
  background: ${props => props.theme.palette.grey[700]};
  display: flex;
  align-items: center;
  padding: 0 10px;
  justify-content: space-between;
`;

const RowContainer = styled.div.attrs(props => ({
  style: props.override
}))`
  width: 100%;
  background: ${props => props.theme.palette.grey[800]};
  border: solid 5px ${props => props.theme.palette.grey[700]};
  border-style: solid none solid none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  padding: 0 10px;
  .leftPartContent {
    display: flex;
    justify-content: center;
    align-items: center;
    & > * {
      margin-right: 12px;
    }
  }
  .rowCenterContent {
    flex: 1;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: color 0.1s ease-in-out;
    cursor: pointer;
    svg {
      margin-right: 10px;
    }
    &:hover {
      color: ${props => props.theme.palette.text.primary};
    }
  }
  .rightPartContent {
    display: flex;
    justify-content: center;
    align-items: center;
    & > * {
      margin-left: 10px;
    }
  }
`;

export const keyFrameMoveUpDown = keyframes`
    0% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-15px);
    }
    
    `;

const DragArrow = styled(FontAwesomeIcon)`
  ${props =>
    props.fileDrag ? props.theme.palette.primary.main : 'transparent'};

  color: ${props => props.theme.palette.primary.main};

  animation: ${keyFrameMoveUpDown} 1.5s linear infinite;
`;

const CopyTitle = styled.h1`
  ${props =>
    props.fileDrag ? props.theme.palette.primary.main : 'transparent'};

  color: ${props => props.theme.palette.primary.main};

  animation: ${keyFrameMoveUpDown} 1.5s linear infinite;
`;

let watcher;

const toggleModDisabled = async (
  c,
  instanceName,
  instancePath,
  item,
  dispatch
) => {
  const destFileName = c ? item.replace('.disabled', '') : `${item}.disabled`;

  await fse.move(
    path.join(instancePath, 'resourcepacks', item),
    path.join(instancePath, 'resourcepacks', destFileName)
  );
};

const createItemData = memoize(
  (items, instanceName, instancePath, selectedItems, setSelectedItems) => ({
    items,
    instanceName,
    instancePath,
    selectedItems,
    setSelectedItems
  })
);
const NotItemsAvailable = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ResourcePacks = ({ instanceName }) => {
  const instancesPath = useSelector(_getInstancesPath);
  const [resourcePacks, setResourcePacks] = useState([]);
  const [dragCompleted, setDragCompleted] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [dragCompletedPopulated, setDragCompletedPopulated] = useState(false);
  const resourcePacksPath = path.join(
    instancesPath,
    instanceName,
    'resourcepacks'
  );

  const deleteFile = useCallback(
    async (
      item,
      instancesPath,
      selectedItems,
      resourcePacksPath,
      instanceName
    ) => {
      if (selectedItems.length === 0 && item) {
        await fse.remove(
          path.join(instancesPath, instanceName, 'resourcepacks', item)
        );
      } else if (selectedItems.length === 1) {
        await fse.remove(
          path.join(
            instancesPath,
            instanceName,
            'resourcepacks',
            selectedItems[0]
          )
        );
      } else if (selectedItems.length > 1 && !item) {
        Promise.all(
          selectedItems.map(async file => {
            await fse.remove(path.join(resourcePacksPath, file));
          })
        );
      }
    },
    [selectedItems, instancesPath, instanceName]
  );

  const Row = memo(({ index, style, data }) => {
    const [loading, setLoading] = useState(false);
    const {
      items,
      instanceName,
      instancePath,
      selectedItems,
      setSelectedItems,
      resourcePacksPath
    } = data;
    const item = items[index];
    const dispatch = useDispatch();
    return (
      <RowContainer index={index} override={style}>
        <div className="leftPartContent">
          <Checkbox
            checked={selectedItems.includes(item)}
            onChange={e => {
              if (e.target.checked) {
                setSelectedItems([...selectedItems, item]);
              } else {
                setSelectedItems(selectedItems.filter(v => v !== item));
              }
            }}
          />
          {item.fileID && <FontAwesomeIcon icon={faTwitch} />}
        </div>
        <div className="rowCenterContent">{item}</div>
        <div className="rightPartContent">
          <Switch
            size="small"
            checked={path.extname(item) !== '.disabled'}
            disabled={loading}
            onChange={async c => {
              setLoading(true);
              await toggleModDisabled(
                c,
                instanceName,
                instancePath,
                item,
                dispatch
              );
              setTimeout(() => setLoading(false), 500);
            }}
          />
          <FontAwesomeIcon
            css={`
              &:hover {
                cursor: pointer;
                path {
                  cursor: pointer;
                  transition: all 0.1s ease-in-out;
                  color: ${props => props.theme.palette.error.main};
                }
              }
            `}
            onClick={() =>
              deleteFile(
                item,
                instancesPath,
                selectedItems,
                resourcePacksPath,
                instanceName
              )
            }
            icon={faTrash}
          />
        </div>
      </RowContainer>
    );
  }, areEqual);

  const openFolderDialog = async () => {
    const dialog = await ipcRenderer.invoke('openFileDialog', [
      { extensions: ['7zip', 'zip'] }
    ]);
    if (dialog.canceled) return;
    const fileName = path.basename(dialog.filePaths[0]);
    await fse.copy(
      dialog.filePaths[0],
      path.join(instancesPath, instanceName, 'resourcepacks', fileName)
    );
  };

  const startListener = async () => {
    await makeDir(resourcePacksPath);
    const files = await fs.readdir(resourcePacksPath);
    setResourcePacks(files);
    watcher = watch(resourcePacksPath, async (event, filename) => {
      if (filename) {
        const resourcePackFiles = await fs.readdir(resourcePacksPath);
        setResourcePacks(resourcePackFiles);
      }
    });
  };

  useEffect(() => {
    startListener();
    return () => watcher?.close();
  }, []);

  useEffect(() => {
    if (dragCompletedPopulated) {
      const AllFilesAreCompleted = Object.keys(dragCompleted).every(x =>
        resourcePacks.find(y => y === x)
      );

      setNumOfDraggedFiles(numOfDraggedFiles - 1);

      if (AllFilesAreCompleted) {
        setFileDrop(false);
        setFileDrag(false);
      }
    }
  }, [dragCompleted, resourcePacks]);

  const itemData = createItemData(
    resourcePacks,
    instanceName,
    path.join(instancesPath, instanceName),
    selectedItems,
    setSelectedItems,
    resourcePacksPath
  );

  return (
    <div
      css={`
        flex: 1;
      `}
    >
      <Header>
        <div
          css={`
            display: flex;
            justify-content: center;
            align-items: center;
          `}
        >
          <Checkbox
            checked={
              selectedItems.length === resourcePacks.length &&
              selectedItems.length !== 0
            }
            indeterminate={
              selectedItems.length !== 0 &&
              selectedItems.length !== resourcePacks.length
            }
            onChange={() =>
              selectedItems.length !== resourcePacks.length
                ? setSelectedItems(resourcePacks.map(v => v))
                : setSelectedItems([])
            }
          >
            Select All
          </Checkbox>
          <FontAwesomeIcon
            css={`
              margin: 0 10px;
              &:hover {
                cursor: pointer;
                path {
                  cursor: pointer;
                  transition: all 0.1s ease-in-out;
                  color: ${props => props.theme.palette.error.main};
                }
              }
            `}
            onClick={() =>
              deleteFile(
                null,
                instancesPath,
                selectedItems,
                resourcePacksPath,
                instanceName
              )
            }
            icon={faTrash}
          />
        </div>
        <Button
          css={`
            margin: 0 10px;
          `}
          type="primary"
          onClick={() => {
            openFolderDialog();
          }}
        >
          Add ResourcePack
        </Button>
      </Header>

      <DragnDropEffect
        instancesPath={instancesPath}
        instanceName={instanceName}
        fileList={resourcePacks}
      >
        {resourcePacks.length === 0 && (
          <NotItemsAvailable>No ResourcePacks Available</NotItemsAvailable>
        )}
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              itemData={itemData}
              itemCount={resourcePacks.length}
              itemSize={60}
              width={width}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      </DragnDropEffect>
    </div>
  );
};

export default memo(ResourcePacks);
