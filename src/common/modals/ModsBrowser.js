import React, { memo, useEffect, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import styled from 'styled-components';
import InfiniteLoader from 'react-window-infinite-loader';
import { Input, Select, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import { FixedSizeGrid as Grid } from 'react-window';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import Modal from '../components/Modal';
import { getSearch, getAddonFiles } from '../api';
import { openModal } from '../reducers/modals/actions';
import { _getInstance } from '../utils/selectors';
import { FABRIC, FORGE } from '../utils/constants';
import {
  getFirstPreferredCandidate,
  filterFabricFilesByVersion,
  filterForgeFilesByVersion,
  getPatchedInstanceType
} from '../../app/desktop/utils';
import { sortByDate } from '../utils';
import sendMessage from '../utils/sendMessage';
import EV from '../messageEvents';

const CellContainer = styled.div.attrs(props => ({
  style: props.override
}))`
  height: 100%;
  width: 100%;
  padding: 10px;
  div {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    border-radius: 4px;
    font-size: 24px;
    cursor: pointer;
    .hoverContainer {
      position: absolute;
      opacity: 0;
      font-size: 20px;
      display: flex;
      text-align: center;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: calc(100% - 20px);
      height: calc(100% - 20px);
      margin: 0 auto;
      padding: 10px;
      backdrop-filter: blur(10px);
      transition: opacity 150ms ease-in-out;
      & > div {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 22px;
        font-weight: 700;
        transition: all 150ms ease-in-out;
        color: ${props => props.theme.palette.text.primary};
      }
      &:hover {
        opacity: 1;
      }
    }
  }
`;

const Cell = ({
  columnIndex,
  rowIndex,
  style,
  isNextPageLoading,
  items,
  version,
  installedMods,
  instanceName
}) => {
  const instance = useSelector(state => _getInstance(state)(instanceName));
  const curseReleaseChannel = useSelector(
    state => state.settings.curseReleaseChannel
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  if (3 * rowIndex + columnIndex >= items.length && !isNextPageLoading)
    return <div />;

  const mod = items[3 * rowIndex + columnIndex];
  const primaryImage = (mod?.attachments || []).find(v => v.isDefault);
  const isInstalled = installedMods.find(v => v.projectID === mod?.id);

  return (
    <CellContainer mod={mod} override={style}>
      {isInstalled && (
        <FontAwesomeIcon
          icon={faCheck}
          size="2x"
          css={`
            position: absolute;
            top: 20px;
            left: 20px;
            color: ${props => props.theme.palette.primary.main};
          `}
        />
      )}
      <div
        onClick={() => {
          dispatch(
            openModal('ModOverview', {
              gameVersion: version,
              projectID: mod.id,
              ...(isInstalled && { fileID: isInstalled.fileID }),
              ...(isInstalled && { fileName: isInstalled.fileName }),
              instanceName
            })
          );
        }}
        // eslint-disable-next-line
        style={{
          background: `linear-gradient(
            rgba(0, 0, 0, 0.9),
            rgba(0, 0, 0, 0.9)
            ), url('${primaryImage?.thumbnailUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="hoverContainer">
          <div>{mod?.name}</div>
          {!isInstalled &&
            (error || (
              <Button
                type="primary"
                loading={loading}
                onClick={async e => {
                  setLoading(true);
                  e.stopPropagation();
                  const files = (await getAddonFiles(mod?.id)).data.sort(
                    sortByDate
                  );
                  const isFabric = getPatchedInstanceType(instance) === FABRIC;
                  const isForge = getPatchedInstanceType(instance) === FORGE;

                  let filteredFiles = [];

                  if (isFabric) {
                    filteredFiles = filterFabricFilesByVersion(files, version);
                  } else if (isForge) {
                    filteredFiles = filterForgeFilesByVersion(files, version);
                  }

                  const preferredFile = getFirstPreferredCandidate(
                    filteredFiles,
                    curseReleaseChannel
                  );

                  if (preferredFile === null) {
                    setLoading(false);
                    setError('Mod Not Available');
                    console.error(
                      `Could not find any release candidate for addon: ${mod?.id} / ${version}`
                    );
                    return;
                  }

                  await sendMessage(EV.INSTALL_MOD, [
                    mod?.id,
                    preferredFile?.id,
                    instanceName,
                    version
                  ]);
                  setLoading(false);
                }}
              >
                INSTALL
              </Button>
            ))}
        </div>
        {mod?.name}
      </div>
    </CellContainer>
  );
};

const MemoizedCell = memo(Cell);

const ModsListWrapper = ({
  // Are there more items to load?
  // (This information comes from the most recent API request.)
  hasNextPage,

  // Are we currently loading a page of items?
  // (This may be an in-flight flag in your Redux store for example.)
  isNextPageLoading,

  // Array of items loaded so far.
  items,

  // Callback function responsible for loading the next page of items.
  loadNextPage,
  searchQuery,
  width,
  height,
  instance,
  version,
  installedMods,
  instanceName
}) => {
  // If there are more items to be loaded then add an extra row to hold a loading indicator.
  const itemCount = hasNextPage ? items.length + 3 : items.length;

  // Only load 1 page of items at a time.
  // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
  const loadMoreItems = loadNextPage;

  // Every row is loaded except for our loading indicator row.
  const isItemLoaded = index => !hasNextPage || index < items.length;

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={itemCount}
      loadMoreItems={() => loadMoreItems(searchQuery)}
      threshold={20}
    >
      {({ onItemsRendered, ref }) => (
        <Grid
          ref={ref}
          useIsScrolling
          onItemsRendered={gridData => {
            const useOverscanForLoading = true; // default is true

            const {
              visibleRowStartIndex,
              visibleRowStopIndex,
              visibleColumnStopIndex,
              overscanRowStartIndex,
              overscanRowStopIndex,
              overscanColumnStopIndex
            } = gridData;

            const endCol =
              (useOverscanForLoading
                ? overscanColumnStopIndex
                : visibleColumnStopIndex) + 1;

            const startRow = useOverscanForLoading
              ? overscanRowStartIndex
              : visibleRowStartIndex;
            const endRow = useOverscanForLoading
              ? overscanRowStopIndex
              : visibleRowStopIndex;

            const visibleStartIndex = startRow * endCol;
            const visibleStopIndex = endRow * endCol;

            onItemsRendered({
              // call onItemsRendered from InfiniteLoader so it can load more if needed
              visibleStartIndex,
              visibleStopIndex
            });
          }}
          columnCount={3}
          columnWidth={Math.floor(width / 3) - 10}
          height={height}
          rowCount={
            Math.floor(itemCount / 3) + Math.floor(itemCount % 3 !== 0 ? 1 : 0)
          }
          rowHeight={180}
          width={width}
        >
          {p => (
            <MemoizedCell
              items={items}
              version={version}
              instance={instance}
              isItemLoaded={isItemLoaded}
              isNextPageLoading={isNextPageLoading}
              installedMods={installedMods}
              instanceName={instanceName}
              // eslint-disable-next-line
              {...p}
            />
          )}
        </Grid>
      )}
    </InfiniteLoader>
  );
};

let lastRequest;
const ModsBrowser = ({ instanceName, gameVersion }) => {
  const itemsNumber = 63;

  const [mods, setMods] = useState([]);
  const [areModsLoading, setAreModsLoading] = useState(false);
  const [filterType, setFilterType] = useState('Featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasNextPage, setHasNextPage] = useState(false);
  const instance = useSelector(state => _getInstance(state)(instanceName));

  const installedMods = instance?.mods;

  const [loadMoreModsDebounced] = useDebouncedCallback(
    (s, reset) => {
      loadMoreMods(s, reset);
    },
    500,
    { leading: false, trailing: true }
  );

  useEffect(() => {
    loadMoreMods(searchQuery, true);
  }, [filterType]);

  useEffect(() => {
    loadMoreMods();
  }, []);

  const loadMoreMods = async (searchP = '', reset) => {
    const reqObj = {};
    lastRequest = reqObj;
    const isReset = reset !== undefined ? reset : false;
    setAreModsLoading(true);
    const { data } = await getSearch(
      'mods',
      searchP,
      itemsNumber,
      isReset ? 0 : mods.length,
      filterType,
      filterType !== 'Author' && filterType !== 'Name',
      gameVersion,
      getPatchedInstanceType(instance) === FABRIC ? 4780 : null
    );
    const newMods = reset ? data : mods.concat(data);
    if (lastRequest === reqObj) {
      setMods(newMods || []);
      setHasNextPage((newMods || []).length % itemsNumber === 0);
    }
    setAreModsLoading(false);
  };

  return (
    <Modal
      css={`
        height: 85%;
        width: 90%;
        max-width: 1500px;
      `}
      title="Instance Manager"
    >
      <Container>
        <Header>
          <Select
            css={`
              width: 160px;
              margin: 0 10px;
            `}
            defaultValue={filterType}
            onChange={setFilterType}
            disabled={areModsLoading}
          >
            <Select.Option value="Featured">Featured</Select.Option>
            <Select.Option value="Popularity">Popularity</Select.Option>
            <Select.Option value="LastUpdated">Last Updated</Select.Option>
            <Select.Option value="Name">Name</Select.Option>
            <Select.Option value="Author">Author</Select.Option>
            <Select.Option value="TotalDownloads">Downloads</Select.Option>
          </Select>
          <Input
            css={`
              height: 32px;
            `}
            placeholder="Search for a mod"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              loadMoreModsDebounced(e.target.value, true);
            }}
            allowClear
          />
        </Header>
        <AutoSizer>
          {({ height, width }) => (
            <ModsListWrapper
              hasNextPage={hasNextPage}
              isNextPageLoading={areModsLoading}
              items={mods}
              width={width}
              height={height - 50}
              loadNextPage={loadMoreMods}
              searchQuery={searchQuery}
              version={gameVersion}
              installedMods={installedMods}
              instanceName={instanceName}
            />
          )}
        </AutoSizer>
      </Container>
    </Modal>
  );
};

export default memo(ModsBrowser);

const Container = styled.div`
  height: 100%;
  width: 100%;
`;

const Header = styled.div`
  width: 100%;
  height: 50px;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
`;
