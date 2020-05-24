/* eslint-disable */
import React, { memo, useState, useEffect, useMemo, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import memoize from 'memoize-one';
import path from 'path';
import pMap from 'p-map';
import { promises as fs, watch } from 'fs';
import makeDir from 'make-dir';
import { ipcRenderer } from 'electron';
import { FixedSizeList as List, areEqual } from 'react-window';
import { Input, Button, Spin } from 'antd';
// import { Checkbox, Input, Button, Switch, Spin, Dropdown, Menu } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faArrowDown
  // faEllipsisV
} from '@fortawesome/free-solid-svg-icons';
import { useSelector, useDispatch } from 'react-redux';
import { Transition } from 'react-transition-group';
import AutoSizer from 'react-virtualized-auto-sizer';
import { faTwitch } from '@fortawesome/free-brands-svg-icons';
import fse, { copySync } from 'fs-extra';
import { _getInstance, _getInstancesPath } from '../../utils/selectors';
// import {
//   updateInstanceConfig,
//   deleteMod,
//   updateMod
// } from '../../reducers/actions';
// import { openModal } from '../../reducers/modals/actions';

const antIcon = (
  <LoadingOutlined
    css={`
      font-size: 24px;
    `}
    spin
  />
);

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
  background: ${props => props.theme.palette.grey[props.index % 2 ? 700 : 800]};
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
      color: ${props => props.theme.palette.primary.main};
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

const DragEnterEffect = styled.div`
  position: absolute;
  display: flex;
  flex-direction; column;
  justify-content: center;
  align-items: center;
  border: solid 5px ${props => props.theme.palette.primary.main};
  transition: opacity 0.2s ease-in-out;
  border-radius: 3px;
  width: 100%;
  height: 100%;
  margin-top: 3px;
  z-index: ${props =>
    props.transitionState !== 'entering' && props.transitionState !== 'entered'
      ? -1
      : 2};
  backdrop-filter: blur(4px);
  background: linear-gradient(
    0deg,
    rgba(0, 0, 0, .3) 40%,
    rgba(0, 0, 0, .3) 40%
  );
  opacity: ${({ transitionState }) =>
    transitionState === 'entering' || transitionState === 'entered' ? 1 : 0};
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

// const DeleteSelectedMods = styled(({ selectedMods, ...props }) => (
//   // eslint-disable-next-line react/jsx-props-no-spreading
//   <FontAwesomeIcon {...props} />
// ))`
//   margin: 0 10px;
//   ${props =>
//     props.selectedMods > 0 &&
//     `&:hover {
//   cursor: pointer;
//   path {
//     cursor: pointer;
//     transition: all 0.1s ease-in-out;
//     color: ${props.theme.palette.error.main};
//   }
// }`}
// `;

let watcher;

// const toggleModDisabled = async (
//   c,
//   instanceName,
//   instancePath,
//   mod,
//   dispatch
// ) => {
//   const destFileName = c
//     ? mod.fileName.replace('.disabled', '')
//     : `${mod.fileName}.disabled`;
//   await dispatch(
//     updateInstanceConfig(instanceName, prev => ({
//       ...prev,
//       mods: prev.mods.map(m => {
//         if (m.fileName === mod.fileName) {
//           return {
//             ...m,
//             fileName: destFileName
//           };
//         }
//         return m;
//       })
//     }))
//   );
//   await fse.move(
//     path.join(instancePath, 'mods', mod.fileName),
//     path.join(instancePath, 'mods', destFileName)
//   );
// };

// const deleteFile = useCallback(
//   async (
//     fileName,
//     instancesPath,
//     selectedItems,
//     resourcePacksPath,
//     instanceName
//   ) => {
//     if (selectedItems.length === 1) {
//       await fse.remove(
//         path.join(
//           instancesPath,
//           instanceName,
//           'resourcepacks',
//           selectedItems[0]
//         )
//       );
//     } else if (selectedItems.length > 1) {
//       Promise.all(
//         selectedItems.map(async screenShot => {
//           await fse.remove(
//             path.join(
//               resourcePacksPath,
//               instanceName,
//               'resourcepacks',
//               screenShot
//             )
//           );
//         })
//       );
//     }
//   },
//   [selectedItems, instancesPath, instanceName]
// );

const Row = memo(({ index, style, data }) => {
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const {
    items,
    instanceName,
    instancesPath,
    selectedItems,
    setSelectedItems,
    resourcePacksPath
  } = data;
  const item = items[index];
  const dispatch = useDispatch();

  return (
    <RowContainer index={index} override={style}>
      <div className="leftPartContent">
        {/* <Checkbox
          checked={selectedMods.includes(item.fileName)}
          onChange={e => {
            if (e.target.checked) {
              setSelectedMods([...selectedMods, item.fileName]);
            } else {
              setSelectedMods(selectedMods.filter(v => v !== item.fileName));
            }
          }}
        /> */}
        {item.fileID && <FontAwesomeIcon icon={faTwitch} />}
      </div>
      <div className="rowCenterContent">{item}</div>
      <div className="rightPartContent">
        {/* <Switch
          size="small"
          checked={path.extname(item) !== '.disabled'}
          disabled={loading || updateLoading}
          onChange={async c => {
            setLoading(true);
            await toggleModDisabled(c, item, instancePath, item, dispatch);
            setTimeout(() => setLoading(false), 500);
          }}
        /> */}
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
          // onClick={() => {
          //   dispatch(
          //   //   openModal('ActionConfirmation', {
          //   //     resourcePacksPath,
          //   //     selectedItems,
          //   //     setSelectedItems,
          //   //     instanceName,
          //   //     instancesPath,
          //   //     message: 'Are you sure you want to delete this image?',
          //   //     fileName: item,
          //   //     confirmCallback: deleteFile,
          //   //     title: 'Confirm'
          //   //   })
          //   // );
          // }}
          icon={faTrash}
        />
      </div>
    </RowContainer>
  );
}, areEqual);

const createItemData = memoize(
  (
    items,
    instanceName,
    instancesPath,
    gameVersion,
    selectedMods,
    setSelectedMods,
    latestMods
  ) => ({
    items,
    instanceName,
    instancesPath,
    gameVersion,
    selectedMods,
    setSelectedMods,
    latestMods
  })
);

// const sort = arr =>
//   arr.slice().sort((a, b) => a.fileName.localeCompare(b.fileName));

// const filter = (arr, search) =>
//   arr.filter(
//     mod =>
//       mod.fileName.toLowerCase().includes(search.toLowerCase()) ||
//       mod.displayName.toLowerCase().includes(search.toLowerCase())
//   );

const ResourcePacks = ({ instanceName }) => {
  // const instance = useSelector(state => _getInstance(state)(instanceName));
  const instancesPath = useSelector(_getInstancesPath);
  const [resourcePacks, setResourcePacks] = useState([]);
  const [search, setSearch] = useState('');
  const [fileDrag, setFileDrag] = useState(false);
  const [fileDrop, setFileDrop] = useState(false);
  const [numOfDraggedFiles, setNumOfDraggedFiles] = useState(0);
  const [dragCompleted, setDragCompleted] = useState({});
  // const [filePath, setFilePath] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [dragCompletedPopulated, setDragCompletedPopulated] = useState(false);
  const resourcePacksPath = path.join(
    instancesPath,
    instanceName,
    'resourcepacks'
  );

  const dispatch = useDispatch();

  const openFolderDialog = async () => {
    const dialog = await ipcRenderer.invoke('openFileDialog', [
      { extensions: ['7zip', 'zip'] }
    ]);
    if (dialog.canceled) return;

    console.log('d', dialog);
    const fileName = path.basename(dialog.filePaths[0]);
    await fse.copy(
      dialog.filePaths[0],
      path.join(instancesPath, instanceName, 'resourcepacks', fileName)
    );
  };

  const startListener = async () => {
    await makeDir(resourcePacksPath);
    const files = await fs.readdir(resourcePacksPath);
    console.log('fff', files);
    setResourcePacks(files);
    watcher = watch(resourcePacksPath, async (event, filename) => {
      console.log('filename', filename);
      if (filename) {
        const resourcePackFiles = await fs.readdir(resourcePacksPath);
        setResourcePacks(resourcePackFiles);
      }
    });
  };

  useEffect(() => {
    startListener();
    console.log('re', resourcePacksPath);
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

  // useEffect(() => {
  //   setMods(filter(sort(instance.mods), search));
  // }, [search, instance.mods]);

  const itemData = createItemData(
    resourcePacks,
    instancesPath,
    instanceName,
    path.join(instancesPath, instanceName),
    selectedItems,
    setSelectedItems,
    resourcePacksPath
  );

  const onDragOver = e => {
    setFileDrag(true);
    e.preventDefault();
  };

  const onDrop = async e => {
    setFileDrop(true);
    const dragComp = {};
    const { files } = e.dataTransfer;
    const arrTypes = Object.values(files).map(file => {
      const fileName = file.name;
      const fileType = fileName.split('.')[1];
      return fileType;
    });
    console.log('file', files);

    await pMap(
      Object.values(files),
      async file => {
        const fileName = file.name;
        const fileType = fileName.split('.')[1];

        dragComp[fileName] = false;

        setNumOfDraggedFiles(files.length);

        const { path: filePath } = file;
        console.log('ff', fileName, dragComp[fileName]);

        if (Object.values(files).length === 1) {
          if (
            fileType === 'zip' ||
            fileType === '7z' ||
            fileType === 'disabled'
          ) {
            await fse.copy(
              filePath,
              path.join(instancesPath, instanceName, 'resourcepacks', fileName)
            );
            dragComp[fileName] = true;
            console.log('ffaa', fileName, dragComp[fileName]);
            setFileDrop(false);
          } else {
            console.error('This file is not a zip');
            setFileDrop(false);
            setFileDrag(false);
          }
        } else {
          /* eslint-disable */
          if (arrTypes.includes('7z') || arrTypes.includes('zip')) {
            if (fileType === 'zip' || fileType === '7z') {
              await fse.copy(
                filePath,
                path.join(
                  instancesPath,
                  instanceName,
                  'resourcepacks',
                  fileName
                )
              );
              dragComp[fileName] = true;
            } else {
              setFileDrop(false);
              setFileDrag(false);
            }
          } else {
            console.error('The files are  not a zips!');
            setFileDrop(false);
            setFileDrag(false);
          }
        }
      },
      { concurrency: 10 }
    );
    setDragCompletedPopulated(files.length === Object.values(dragComp).length);
    setDragCompleted(dragComp);
    console.log('test1', dragCompleted);
  };

  const onDragEnter = e => {
    setFileDrag(true);
    e.preventDefault();
    e.stopPropagation();
  };

  const onDragLeave = () => {
    setFileDrag(false);
  };

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
        ></div>
        <Button
          type="primary"
          onClick={() => {
            openFolderDialog();
          }}
        >
          Add ResourcePack
        </Button>
        <Input
          allowClear
          value={search}
          defaultValue={search}
          onChange={e => setSearch(e.target.value)}
          css={`
            width: 200px;
          `}
          // placeholder={`Search ${mods.length} mods`}
        />
      </Header>
      <div
        onDragEnter={onDragEnter}
        css={`
          width: 100%;
          height: calc(100% - 40px);
        `}
      >
        <Transition timeout={300} in={fileDrag}>
          {transitionState => (
            <DragEnterEffect
              onDrop={onDrop}
              transitionState={transitionState}
              onDragLeave={onDragLeave}
              fileDrag={fileDrag}
              onDragOver={onDragOver}
            >
              {fileDrop ? (
                <Spin
                  indicator={antIcon}
                  css={`
                    width: 30px;
                  `}
                >
                  {numOfDraggedFiles > 0 ? numOfDraggedFiles : 1}
                </Spin>
              ) : (
                <div
                  css={`
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                  `}
                  onDragLeave={e => e.stopPropagation()}
                >
                  <CopyTitle>copy</CopyTitle>
                  <DragArrow icon={faArrowDown} size="3x" />
                </div>
              )}
            </DragEnterEffect>
          )}
        </Transition>
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
      </div>
    </div>
  );
};

export default memo(ResourcePacks);
