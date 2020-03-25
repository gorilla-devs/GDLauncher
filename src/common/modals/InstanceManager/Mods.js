import React, { memo, useState, useEffect } from 'react';
import styled from 'styled-components';
import memoize from 'memoize-one';
import path from 'path';
import { FixedSizeList as List, areEqual } from 'react-window';
import { Checkbox, Input, Button, Switch } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { useSelector, useDispatch } from 'react-redux';
import { Transition } from 'react-transition-group';
import AutoSizer from 'react-virtualized-auto-sizer';
import { faTwitch } from '@fortawesome/free-brands-svg-icons';
import fse from 'fs-extra';
import { _getInstance, _getInstancesPath } from '../../utils/selectors';
import { updateInstanceConfig } from '../../reducers/actions';
import { openModal } from '../../reducers/modals/actions';

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
    button {
      margin-right: 15px;
    }
    svg {
      &:hover {
        cursor: pointer;
        path {
          cursor: pointer;
          transition: all 0.1s ease-in-out;
          color: ${props => props.theme.palette.error.main};
        }
      }
    }
  }
`;

const DragEnterEffect = styled.div`
  position: absolute;
  display: flex;
  flex-direction; row;
  justify-content: center;
  align-items: center;
  border: solid 5px ${props => props.theme.palette.primary.main};
  opacity: ${props => (props.fileDrag ? '1' : '0')};
  transition: opacity 0.2s ease-in-out;
  border-radius: 3px;
  width: 100%;
  height: 100%;
  margin-top: 3px;
  z-index: 2;
  backdrop-filter: blur(4px);
  background: linear-gradient(
    0deg,
    rgba(0, 0, 0, .3) 40%,
    rgba(0, 0, 0, .3) 40%
  );
  opacity: ${({ transitionState }) =>
    transitionState === 'entering' || transitionState === 'entered' ? 1 : 0};
`;

const DragArrow = styled(FontAwesomeIcon)`
  ${props =>
    props.fileDrag ? props.theme.palette.primary.main : 'transparent'};

  color: ${props => props.theme.palette.primary.main};

  animation: MoveUpDown 1.5s linear infinite;

  @keyframes MoveUpDown {
    0% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-15px);
    }
  }
`;

const deleteMod = async (instanceName, instancePath, mod, dispatch) => {
  await dispatch(
    updateInstanceConfig(instanceName, prev => ({
      ...prev,
      mods: prev.mods.filter(m => m.fileName !== mod.fileName)
    }))
  );
  await fse.remove(path.join(instancePath, 'mods', mod.fileName));
};

const deleteMods = async (
  instanceName,
  instancePath,
  selectedMods,
  dispatch
) => {
  await dispatch(
    updateInstanceConfig(instanceName, prev => ({
      ...prev,
      mods: prev.mods.filter(m => !selectedMods.includes(m.fileName))
    }))
  );
  await Promise.all(
    selectedMods.map(fileName =>
      fse.remove(path.join(instancePath, 'mods', fileName))
    )
  );
};

const toggleModDisabled = async (
  c,
  instanceName,
  instancePath,
  mod,
  dispatch
) => {
  const destFileName = c
    ? mod.fileName.replace('.disabled', '')
    : `${mod.fileName}.disabled`;
  await dispatch(
    updateInstanceConfig(instanceName, prev => ({
      ...prev,
      mods: prev.mods.map(m => {
        if (m.fileName === mod.fileName) {
          return {
            ...m,
            fileName: destFileName
          };
        }
        return m;
      })
    }))
  );
  await fse.move(
    path.join(instancePath, 'mods', mod.fileName),
    path.join(instancePath, 'mods', destFileName)
  );
};

const Row = memo(({ index, style, data }) => {
  const [loading, setLoading] = useState(false);
  const {
    items,
    instanceName,
    instancePath,
    gameVersion,
    selectedMods,
    setSelectedMods
  } = data;
  const item = items[index];
  const dispatch = useDispatch();
  return (
    <RowContainer index={index} override={style}>
      <div className="leftPartContent">
        <Checkbox
          checked={selectedMods.includes(item.fileName)}
          onChange={e => {
            if (e.target.checked) {
              setSelectedMods([...selectedMods, item.fileName]);
            } else {
              setSelectedMods(selectedMods.filter(v => v !== item.fileName));
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
        {item.fileName}
      </div>
      <div className="rightPartContent">
        <Switch
          size="small"
          checked={path.extname(item.fileName) !== '.disabled'}
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
          onClick={() => deleteMod(instanceName, instancePath, item, dispatch)}
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
    instancePath,
    gameVersion,
    selectedMods,
    setSelectedMods
  ) => ({
    items,
    instanceName,
    instancePath,
    gameVersion,
    selectedMods,
    setSelectedMods
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

const Mods = ({ instanceName }) => {
  const instance = useSelector(state => _getInstance(state)(instanceName));
  const instancesPath = useSelector(_getInstancesPath);
  const [mods, setMods] = useState(sort(instance.mods));
  const [selectedMods, setSelectedMods] = useState([]);
  const [search, setSearch] = useState('');
  const [fileDrag, setFileDrag] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('fileDrag', fileDrag);
  }, [fileDrag]);

  useEffect(() => {
    setMods(filter(sort(instance.mods), search));
  }, [search, instance.mods]);

  const itemData = createItemData(
    mods,
    instanceName,
    path.join(instancesPath, instanceName),
    instance.modloader[1],
    selectedMods,
    setSelectedMods
  );

  // const onDragOver = e => {
  //   console.log('hover', e);
  //   setFileDrag(true);
  //   // e.preventDefault();
  // };

  const onDragEnter = e => {
    console.log('draggato', e);
    setFileDrag(true);
    // e.preventDefault();
  };

  const onDragLeave = e => {
    console.log('drag leave', e);
    setFileDrag(false);
    // e.preventDefault();
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
          <FontAwesomeIcon
            onClick={async () => {
              if (selectedMods.length === 0) return;
              await deleteMods(
                instanceName,
                path.join(instancesPath, instanceName),
                selectedMods,
                dispatch
              );
              setSelectedMods([]);
            }}
            selectedMods={selectedMods}
            css={`
              margin-left: 10px;
              ${props =>
                props.selectedMods.length > 0 &&
                `&:hover {
                cursor: pointer;
                path {
                  cursor: pointer;
                  transition: all 0.1s ease-in-out;
                  color: ${props.theme.palette.error.main};
                }
              }`}
            `}
            icon={faTrash}
          />
          {/* <FontAwesomeIcon
            css={`
              margin-left: 10px;
            `}
            icon={faDownload}
          /> */}
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
          {transitionState =>
            fileDrag && (
              <DragEnterEffect
                transitionState={transitionState}
                onDragLeave={onDragLeave}
                fileDrag={fileDrag}
                // onDragOver={onDragOver}
                // onDrop={onDragLeave}
              >
                <DragArrow icon={faArrowDown} size="3x" />
              </DragEnterEffect>
            )
          }
        </Transition>
        {/* {fileDrag && (
          <DragEnterEffect
            onDragLeave={onDragLeave}
            fileDrag={fileDrag}
            // onDragOver={onDragOver}
            // onDrop={onDragLeave}
          />
        )} */}
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
