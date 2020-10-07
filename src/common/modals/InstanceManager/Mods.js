import React, { memo, useState, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import memoize from 'memoize-one';
import { ContextMenuTrigger, ContextMenu, MenuItem } from 'react-contextmenu';
import { Portal } from 'react-portal';
import path from 'path';
import pMap from 'p-map';
import { FixedSizeList as List, areEqual } from 'react-window';
import { Checkbox, Input, Button, Switch, Spin, Dropdown, Menu } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faArrowDown,
  faDownload,
  faEllipsisV,
  faCopy,
  faFolder
} from '@fortawesome/free-solid-svg-icons';
import { useSelector, useDispatch } from 'react-redux';
import { Transition } from 'react-transition-group';
import AutoSizer from 'react-virtualized-auto-sizer';
import { faTwitch } from '@fortawesome/free-brands-svg-icons';
import fse from 'fs-extra';
import makeDir from 'make-dir';
import { _getInstance, _getInstancesPath } from '../../utils/selectors';
import { openModal } from '../../reducers/modals/actions';
import sendMessage from '../../utils/sendMessage';
import EV from '../../messageEvents';

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
  height: 100%;
  background: ${props =>
    props.disabled || props.selected
      ? 'transparent'
      : props.theme.palette.grey[800]};
  ${props =>
    props.disabled &&
    !props.selected &&
    `box-shadow: inset 0 0 0 3px ${props.theme.palette.colors.red};`}
  ${props =>
    props.selected &&
    `box-shadow: inset 0 0 0 3px ${props.theme.palette.primary.main};`}
  transition: border 0.1s ease-in-out;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  box-sizing: content-box;
  padding: 0 10px;
  &:hover {
    .rowCenterContent {
      color: ${props => props.theme.palette.text.primary};
    }
  }
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
    display: flex;
    justify-content: center;
    align-items: center;
    transition: color 0.1s ease-in-out;
    height: 100%;
    ${props =>
      props.isHovered ? `color: ${props.theme.palette.text.primary};` : ''}
    cursor: pointer;
    svg {
      margin-right: 10px;
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

const RowContainerBackground = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  z-index: -1;

  ${props =>
    props.selected &&
    ` background: repeating-linear-gradient(
  45deg,
  ${props.theme.palette.primary.main},
  ${props.theme.palette.primary.main} 10px,
  ${props.theme.palette.primary.dark} 10px,
  ${props.theme.palette.primary.dark} 20px
  );`};

  ${props =>
    props.disabled &&
    !props.selected &&
    `background: repeating-linear-gradient(
  45deg,
  ${props.theme.palette.colors.red},
  ${props.theme.palette.colors.red} 10px,
  ${props.theme.palette.colors.maximumRed} 10px,
  ${props.theme.palette.colors.maximumRed} 20px
  );`};
  filter: brightness(60%);
  transition: opacity 0.1s ease-in-out;
  opacity: ${props => (props.disabled || props.selected ? 1 : 0)};
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

const StyledDropdown = styled.div`
  width: 32px;
  height: 32px;
  padding: 5px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease-in-out;
  cursor: pointer;
  &:hover {
    background: ${props => props.theme.palette.grey[400]};
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

const OpenFolderButton = styled(FontAwesomeIcon)`
  transition: color 0.1s ease-in-out;
  cursor: pointer;
  margin: 0 10px;
  &:hover {
    cursor: pointer;
    path {
      cursor: pointer;
      transition: color 0.1s ease-in-out;
      color: ${props => props.theme.palette.primary.main};
    }
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

const DeleteSelectedMods = styled(({ selectedMods, ...props }) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <FontAwesomeIcon {...props} />
))`
  margin: 0 10px;
  ${props =>
    props.selectedMods > 0 &&
    `&:hover {
  cursor: pointer;
  path {
    cursor: pointer;
    transition: color 0.1s ease-in-out;
    color: ${props.theme.palette.error.main};
  }
}`}
`;

const deleteMods = async (instanceName, selectedMods) => {
  return sendMessage(EV.DELETE_MODS, [instanceName, selectedMods]);
};

const toggleModDisabled = async (c, instanceName, instancePath, mod) => {
  const destFileName = c
    ? mod.fileName.replace('.disabled', '')
    : `${mod.fileName}.disabled`;

  return sendMessage(EV.TOGGLE_MOD_DISABLED, [
    mod.fileName,
    destFileName,
    instanceName
  ]);
};

const Row = memo(({ index, style, data }) => {
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const curseReleaseChannel = useSelector(
    state => state.settings.curseReleaseChannel
  );
  const {
    items,
    instanceName,
    instancePath,
    gameVersion,
    selectedMods,
    setSelectedMods,
    latestMods
  } = data;
  const item = items[index];
  const isUpdateAvailable =
    latestMods[item.projectID] &&
    latestMods[item.projectID].id !== item.fileID &&
    latestMods[item.projectID].releaseType <= curseReleaseChannel;
  const dispatch = useDispatch();

  const name = item.fileName
    .replace('.jar', '')
    .replace('.zip', '')
    .replace('.disabled', '');

  return (
    <>
      <ContextMenuTrigger id={item.displayName}>
        <RowContainer
          index={index}
          name={item.fileName}
          isHovered={isHovered}
          selected={selectedMods.includes(item.fileName)}
          disabled={path.extname(item.fileName) === '.disabled'}
          override={{
            ...style,
            top: style.top + 15,
            height: style.height - 15,
            position: 'absolute',
            width: '97%',
            margin: '15px 0',
            transition: 'height 0.2s ease-in-out'
          }}
        >
          <div className="leftPartContent">
            <Checkbox
              checked={selectedMods.includes(item.fileName)}
              onChange={e => {
                if (e.target.checked) {
                  setSelectedMods([...selectedMods, item.fileName]);
                } else {
                  setSelectedMods(
                    selectedMods.filter(v => v !== item.fileName)
                  );
                }
              }}
            />
            {item.fileID && <FontAwesomeIcon icon={faTwitch} />}
          </div>
          <div
            onClick={() => {
              if (!item.fileID) return;
              dispatch(
                openModal('ModOverview', {
                  projectID: item.projectID,
                  fileID: item.fileID,
                  fileName: item.fileName,
                  gameVersion,
                  instanceName
                })
              );
            }}
            className="rowCenterContent"
          >
            {name}
          </div>
          <div className="rightPartContent">
            {isUpdateAvailable &&
              (updateLoading ? (
                <LoadingOutlined />
              ) : (
                <FontAwesomeIcon
                  css={`
                    &:hover {
                      cursor: pointer;
                      path {
                        cursor: pointer;
                        transition: all 0.1s ease-in-out;
                        color: ${props => props.theme.palette.colors.green};
                      }
                    }
                  `}
                  icon={faDownload}
                  onClick={async () => {
                    setUpdateLoading(true);
                    await sendMessage(EV.UPDATE_MOD, [
                      instanceName,
                      item,
                      latestMods[item.projectID].id,
                      gameVersion
                    ]);
                    setUpdateLoading(false);
                  }}
                />
              ))}
            <Switch
              size="small"
              checked={path.extname(item.fileName) !== '.disabled'}
              disabled={loading || updateLoading}
              onChange={async c => {
                setLoading(true);
                const destFileName = c
                  ? item.fileName.replace('.disabled', '')
                  : `${item.fileName}.disabled`;
                const isCurrentlySelected = selectedMods.find(
                  v => v === item.fileName
                );

                if (isCurrentlySelected) {
                  setSelectedMods(prev => [...prev, destFileName]);
                }

                await toggleModDisabled(c, instanceName, instancePath, item);
                if (isCurrentlySelected) {
                  setSelectedMods(prev =>
                    prev.filter(v => v !== item.fileName)
                  );
                }

                setTimeout(() => {
                  setLoading(false);
                }, 500);
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
              onClick={() => {
                if (!loading && !updateLoading) {
                  deleteMods(instanceName, [item.fileName]);
                }
              }}
              icon={faTrash}
            />
          </div>
          <RowContainerBackground
            selected={selectedMods.includes(item.fileName)}
            disabled={path.extname(item.fileName) === '.disabled'}
          />
        </RowContainer>
      </ContextMenuTrigger>
      <Portal>
        <ContextMenu
          id={item.displayName}
          onShow={() => {
            setSelectedMods([item.fileName]);
            setIsHovered(true);
          }}
          onHide={() => setIsHovered(false)}
        >
          <MenuItem
            onClick={() => {
              sendMessage(EV.COPY_TO_CLIPBOARD, item.displayName);
            }}
          >
            <FontAwesomeIcon
              icon={faCopy}
              css={`
                margin-right: 10px;
              `}
            />
            Copy Name
          </MenuItem>
        </ContextMenu>
      </Portal>
    </>
  );
}, areEqual);

const createItemData = memoize(
  (
    items,
    instanceName,
    instancePath,
    gameVersion,
    selectedMods,
    setSelectedMods,
    latestMods
  ) => ({
    items,
    instanceName,
    instancePath,
    gameVersion,
    selectedMods,
    setSelectedMods,
    latestMods
  })
);

const sort = arr =>
  arr.slice().sort((a, b) => a.fileName.localeCompare(b.fileName));

const filter = (arr, search) =>
  arr.filter(
    mod =>
      mod.fileName.toLowerCase().includes(search.toLowerCase()) ||
      mod.displayName.toLowerCase().includes(search.toLowerCase())
  );

const getFileType = file => {
  const fileName = file.name;
  let fileType = '';

  const splitFileName = fileName.split('.');
  if (splitFileName.length) {
    fileType = splitFileName[splitFileName.length - 1];
  }

  return fileType;
};

const Mods = ({ instanceName }) => {
  const instance = useSelector(state => _getInstance(state)(instanceName));
  const instancesPath = useSelector(_getInstancesPath);
  const curseReleaseChannel = useSelector(
    state => state.settings.curseReleaseChannel
  );
  const latestMods = useSelector(state => state.latestModManifests);
  const [mods, setMods] = useState(sort(instance.mods));
  const [selectedMods, setSelectedMods] = useState([]);
  const [search, setSearch] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [fileDrag, setFileDrag] = useState(false);
  const [fileDrop, setFileDrop] = useState(false);
  const [numOfDraggedFiles, setNumOfDraggedFiles] = useState(0);
  const [dragCompleted, setDragCompleted] = useState({});
  const [dragCompletedPopulated, setDragCompletedPopulated] = useState(false);

  const dispatch = useDispatch();

  const openFolder = async p => {
    await makeDir(p);
    sendMessage(EV.OPEN_FOLDER, p);
  };

  const antIcon = (
    <LoadingOutlined
      css={`
        font-size: 24px;
      `}
      spin
    />
  );

  useEffect(() => {
    const modList = instance.mods;

    if (dragCompletedPopulated) {
      const AllFilesAreCompleted = Object.keys(dragCompleted).every(x =>
        modList.find(y => y.fileName === x)
      );
      setNumOfDraggedFiles(numOfDraggedFiles - 1);

      if (AllFilesAreCompleted) {
        setFileDrop(false);
        setFileDrag(false);
      }
    }
  }, [dragCompleted, instance.mods]);

  useEffect(() => {
    setMods(filter(sort(instance.mods), search));
    setSelectedMods(prev => {
      return prev.filter(v => instance.mods.find(m => m.fileName === v));
    });
  }, [search, instance.mods]);

  const hasModUpdates = useMemo(() => {
    return instance?.mods?.find(v => {
      const isUpdateAvailable =
        latestMods[v.projectID] &&
        latestMods[v.projectID].id !== v.fileID &&
        latestMods[v.projectID].releaseType <= curseReleaseChannel;
      return isUpdateAvailable;
    });
  }, [instance.mods, latestMods]);

  const itemData = createItemData(
    mods,
    instanceName,
    path.join(instancesPath, instanceName),
    instance.modloader[1],
    selectedMods,
    setSelectedMods,
    latestMods
  );

  const onDragOver = e => {
    setFileDrag(true);
    e.preventDefault();
  };

  const onDrop = async e => {
    setFileDrop(true);
    const dragComp = {};
    const { files } = e.dataTransfer;

    await pMap(
      Object.values(files),
      async file => {
        const fileName = file.name;
        const fileType = getFileType(file);
        const existingMods = itemData.items.map(item => item.fileName);

        dragComp[fileName] = false;

        setNumOfDraggedFiles(files.length);

        const { path: filePath } = file;

        if (existingMods.includes(fileName)) {
          console.error(
            'A mod with this name already exists in the instance.',
            file.name
          );
          setFileDrop(false);
          setFileDrag(false);
        } else if (fileType === 'jar' || fileType === 'disabled') {
          await fse.copy(
            filePath,
            path.join(instancesPath, instanceName, 'mods', fileName)
          );
          dragComp[fileName] = true;
        } else {
          console.error('This file is not a mod!', file);
          setFileDrop(false);
          setFileDrag(false);
        }
      },
      { concurrency: 10 }
    );
    setDragCompletedPopulated(files.length === Object.values(dragComp).length);
    setDragCompleted(dragComp);
  };

  const onDragEnter = e => {
    setFileDrag(true);
    e.preventDefault();
    e.stopPropagation();
  };

  const onDragLeave = () => {
    setFileDrag(false);
  };

  const menu = (
    <Menu>
      <Menu.Item
        key="0"
        onClick={async () => {
          dispatch(openModal('ModsUpdater', { instanceName }));
          setIsMenuOpen(false);
        }}
        disabled={!hasModUpdates}
      >
        Update all mods
      </Menu.Item>
    </Menu>
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
              selectedMods.length === mods.length && selectedMods.length !== 0
            }
            indeterminate={
              selectedMods.length !== 0 && selectedMods.length !== mods.length
            }
            onChange={() =>
              selectedMods.length !== mods.length
                ? setSelectedMods(mods.map(v => v.fileName))
                : setSelectedMods([])
            }
          >
            Select All
          </Checkbox>
          <DeleteSelectedMods
            onClick={async () => {
              if (selectedMods.length === 0) return;
              await deleteMods(instanceName, selectedMods);
              setSelectedMods([]);
            }}
            selectedMods={selectedMods.length}
            icon={faTrash}
          />
          <OpenFolderButton
            onClick={() =>
              openFolder(path.join(instancesPath, instanceName, 'mods'))
            }
            icon={faFolder}
          />
          <StyledDropdown
            onClick={() => {
              if (!isMenuOpen) {
                setIsMenuOpen(true);
              }
            }}
          >
            <Dropdown
              overlay={menu}
              visible={isMenuOpen}
              onVisibleChange={setIsMenuOpen}
              trigger={['click']}
            >
              <FontAwesomeIcon icon={faEllipsisV} />
            </Dropdown>
          </StyledDropdown>
        </div>
        <Button
          type="primary"
          onClick={() => {
            dispatch(
              openModal('ModsBrowser', {
                gameVersion: instance.modloader[1],
                instanceName
              })
            );
          }}
        >
          Add Mod
        </Button>
        <Input
          allowClear
          value={search}
          defaultValue={search}
          onChange={e => setSearch(e.target.value)}
          css={`
            width: 200px;
          `}
          placeholder={`Search ${mods.length} mods`}
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
                  <CopyTitle>Copy</CopyTitle>
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
              itemCount={mods.length}
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

export default memo(Mods);
