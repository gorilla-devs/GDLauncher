import React, { memo, useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import memoize from 'memoize-one';
import path from 'path';
import { promises as fs, watch } from 'fs';
import makeDir from 'make-dir';
import { FixedSizeList as List, areEqual } from 'react-window';
import { Checkbox, Button, Switch } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import AutoSizer from 'react-virtualized-auto-sizer';
import { faTwitch } from '@fortawesome/free-brands-svg-icons';
import fse from 'fs-extra';
import { _getInstancesPath } from '../../utils/selectors';
import DragnDropEffect from '../../../ui/DragnDropEffect';
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

const TrashIcon = styled(({ selectedMods, ...props }) => (
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

const RowContainer = styled.div.attrs(props => ({
  style: props.override
}))`
  width: 100%;
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

let watcher;

const toggleResourcePackDisabled = async (c, instancePath, item) => {
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
  const [selectedItems, setSelectedItems] = useState([]);
  const resourcePacksPath = path.join(
    instancesPath,
    instanceName,
    'resourcepacks'
  );
  const [loading, setLoading] = useState(false);

  const deleteFile = useCallback(
    async (
      item,
      instancesPathh,
      selectedItemss,
      rscPacksPath,
      instanceNamee
    ) => {
      if (item) {
        await fse.remove(
          path.join(instancesPathh, instanceNamee, 'resourcepacks', item)
        );
      } else if (selectedItemss.length > 0) {
        await Promise.all(
          selectedItemss.map(async file => {
            await fse.remove(path.join(rscPacksPath, file));
          })
        );
      }
    },
    [selectedItems, instancesPath, instanceName]
  );

  const Row = memo(({ index, style, data }) => {
    const {
      items,
      instanceName: name,
      instancePath,
      selectedItems: slcItems,
      setSelectedItems: setSlcItems,
      resourcePacksPath: rscPacksPath
    } = data;
    const item = items[index];
    return (
      <RowContainer
        index={index}
        override={{
          ...style,
          top: style.top + 15,
          height: style.height - 15,
          position: 'absolute',
          width: '97%',
          margin: '15px 0',
          transition: 'height 0.2s ease-in-out'
        }}
        selected={slcItems.includes(item)}
        disabled={path.extname(item) === '.disabled'}
      >
        <div className="leftPartContent">
          <Checkbox
            checked={slcItems.includes(item)}
            onChange={e => {
              if (e.target.checked) {
                setSlcItems([...slcItems, item]);
              } else {
                setSlcItems(slcItems.filter(v => v !== item));
              }
            }}
          />
          {item.fileID && <FontAwesomeIcon icon={faTwitch} />}
        </div>
        <div className="rowCenterContent">{item.replace('.disabled', '')}</div>
        <div className="rightPartContent">
          <Switch
            size="small"
            checked={path.extname(item) !== '.disabled'}
            disabled={loading}
            onChange={async c => {
              setLoading(true);
              await toggleResourcePackDisabled(c, instancePath, item);
              setTimeout(() => setLoading(false), 500);
            }}
          />
          <TrashIcon
            selectedMods
            onClick={() => {
              deleteFile(item, instancesPath, slcItems, rscPacksPath, name);
            }}
            icon={faTrash}
          />
        </div>
        <RowContainerBackground
          selected={slcItems.includes(item)}
          disabled={path.extname(item) === '.disabled'}
        />
      </RowContainer>
    );
  }, areEqual);

  const openFolderDialog = async () => {
    const dialog = await sendMessage(EV.OPEN_FILE_DIALOG, [
      { name: 'Resource Pack', extensions: ['zip'] },
      { name: 'All', extensions: ['*'] }
    ]);
    if (dialog.canceled) return;
    const fileName = path.basename(dialog.filePaths[0]);
    await fse.copy(
      dialog.filePaths[0],
      path.join(instancesPath, instanceName, 'resourcepacks', fileName)
    );
  };

  const openFolder = async p => {
    await makeDir(p);
    sendMessage(EV.OPEN_FOLDER);
  };

  const startListener = async () => {
    await makeDir(resourcePacksPath);
    const files = await fs.readdir(resourcePacksPath);
    setResourcePacks(files);
    watcher = watch(resourcePacksPath, async (event, filename) => {
      if (filename) {
        const resourcePackFiles = await fs.readdir(resourcePacksPath);
        setResourcePacks(resourcePackFiles);
        setSelectedItems(prev => {
          return prev.filter(v => resourcePackFiles.includes(v));
        });
      }
    });
  };

  useEffect(() => {
    startListener();
    return () => watcher?.close();
  }, []);

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
                ? setSelectedItems(resourcePacks)
                : setSelectedItems([])
            }
          >
            Select All
          </Checkbox>
          <TrashIcon
            selectedMods={selectedItems.length}
            onClick={async () => {
              deleteFile(
                null,
                instancesPath,
                selectedItems,
                resourcePacksPath,
                instanceName
              );
            }}
            icon={faTrash}
          />
          <OpenFolderButton
            onClick={async () => {
              await makeDir(
                path.join(instancesPath, instanceName, 'resourcepacks')
              );
              openFolder(
                path.join(instancesPath, instanceName, 'resourcepacks')
              );
            }}
            icon={faFolder}
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
