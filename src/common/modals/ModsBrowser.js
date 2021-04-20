/* eslint-disable no-nested-ternary */
import React, {
  memo,
  useEffect,
  useState,
  forwardRef,
  useContext
} from 'react';
import { ipcRenderer } from 'electron';
import AutoSizer from 'react-virtualized-auto-sizer';
import styled, { ThemeContext } from 'styled-components';
import memoize from 'memoize-one';
import InfiniteLoader from 'react-window-infinite-loader';
import ContentLoader from 'react-content-loader';
import { Input, Select, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import { FixedSizeList as List } from 'react-window';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { faBomb, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import Modal from '../components/Modal';
import { getSearch, getAddonFiles } from '../api';
import { openModal } from '../reducers/modals/actions';
import { _getInstance } from '../utils/selectors';
import { installMod } from '../reducers/actions';
import { FABRIC, FORGE } from '../utils/constants';
import {
  getFirstPreferredCandidate,
  filterFabricFilesByVersion,
  filterForgeFilesByVersion,
  getPatchedInstanceType
} from '../../app/desktop/utils';

const ItemName = styled.div`
  color: ${props => props.theme.palette.text.third};
  transition: color 0.1s ease-in-out;
  cursor: pointer;
`;

const RowContainer = styled.div`
  display: flex;
  position: relative;
  justify-content: space-between;
  align-items: center;
  width: calc(100% - 30px) !important;
  border-radius: 4px;
  padding: 11px 21px;
  background: ${props => props.theme.palette.grey[800]};
  ${props =>
    props.isInstalled &&
    `border: 2px solid ${props.theme.palette.colors.green};`}

  &:hover {
    ${ItemName} {
      color: ${props => props.theme.palette.text.primary};
    }
  }
`;

const RowInnerContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-style: normal;
  font-weight: bold;
  font-size: 15px;
  line-height: 18px;
  color: ${props => props.theme.palette.text.secondary};
`;

const RowContainerImg = styled.div`
  width: 38px;
  height: 38px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  border-radius: 5px;
  margin-right: 20px;
`;

const ModInstalledIcon = styled(FontAwesomeIcon)`
  position: absolute;
  top: -10px;
  left: -10px;
  color: ${props => props.theme.palette.colors.green};
  font-size: 25px;
  z-index: 1;
`;

const ModsIconBg = styled.div`
  position: absolute;
  top: -10px;
  left: -10px;
  background: ${props => props.theme.palette.grey[800]};
  width: 25px;
  height: 25px;
  border-radius: 50%;
  z-index: 0;
`;

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
  itemData
}) => {
  // If there are more items to be loaded then add an extra row to hold a loading indicator.
  const itemCount = hasNextPage ? items.length + 3 : items.length;

  // Only load 1 page of items at a time.
  // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.

  // const loadMoreItems = loadNextPage;
  const loadMoreItems = isNextPageLoading ? () => {} : loadNextPage;

  // Every row is loaded except for our loading indicator row.
  const isItemLoaded = index => !hasNextPage || index < items.length;

  const innerElementType = forwardRef(({ style, ...rest }, ref) => (
    <div
      ref={ref}
      // eslint-disable-next-line react/forbid-dom-props
      style={{
        ...style,
        paddingTop: 8
      }}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    />
  ));

  const Row = memo(({ index, style, data }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const curseReleaseChannel = useSelector(
      state => state.settings.curseReleaseChannel
    );
    const dispatch = useDispatch();
    const { instanceName, gameVersion, installedMods, instance } = data;

    const item = items[index];

    const isInstalled = installedMods.find(v => v.projectID === item?.id);
    const primaryImage = item?.attachments.find(v => v.isDefault);

    if (!item) {
      return (
        <ModsLoader
          hasNextPage={hasNextPage}
          isNextPageLoading={isNextPageLoading}
          width={width - 10}
          loadNextPage={loadNextPage}
          top={style.top + 15}
        />
      );
    }

    return (
      <RowContainer
        isInstalled={isInstalled}
        style={{
          ...style,
          top: style.top + 10,
          height: style.height - 10,
          position: 'absolute',
          margin: '15px 10px',
          transition: 'height 0.2s ease-in-out'
        }}
      >
        {isInstalled && <ModInstalledIcon icon={faCheckCircle} />}
        {isInstalled && <ModsIconBg />}

        <RowInnerContainer>
          <RowContainerImg img={primaryImage?.thumbnailUrl} />
          <ItemName
            onClick={() => {
              dispatch(
                openModal('ModOverview', {
                  gameVersion,
                  projectID: item.id,
                  ...(isInstalled && { fileID: isInstalled.fileID }),
                  ...(isInstalled && { fileName: isInstalled.fileName }),
                  instanceName
                })
              );
            }}
          >
            {item.name}
          </ItemName>
        </RowInnerContainer>
        {!isInstalled ? (
          error || (
            <div>
              <Button
                type="primary"
                css={`
                  margin-right: 10px;
                `}
                onClick={() => {
                  dispatch(
                    openModal('ModOverview', {
                      gameVersion,
                      projectID: item.id,
                      ...(isInstalled && { fileID: isInstalled.fileID }),
                      ...(isInstalled && { fileName: isInstalled.fileName }),
                      instanceName
                    })
                  );
                }}
              >
                Explore
              </Button>
              <Button
                type="primary"
                onClick={async e => {
                  setLoading(true);
                  e.stopPropagation();
                  const files = (await getAddonFiles(item?.id)).data;

                  const isFabric = getPatchedInstanceType(instance) === FABRIC;
                  const isForge = getPatchedInstanceType(instance) === FORGE;

                  let filteredFiles = [];

                  if (isFabric) {
                    filteredFiles = filterFabricFilesByVersion(
                      files,
                      gameVersion
                    );
                  } else if (isForge) {
                    filteredFiles = filterForgeFilesByVersion(
                      files,
                      gameVersion
                    );
                  }

                  const preferredFile = getFirstPreferredCandidate(
                    filteredFiles,
                    curseReleaseChannel
                  );

                  if (preferredFile === null) {
                    setLoading(false);
                    setError('Mod Not Available');
                    console.error(
                      `Could not find any release candidate for addon: ${item?.id} / ${gameVersion}`
                    );
                    return;
                  }

                  let prev = 0;
                  await dispatch(
                    installMod(
                      item?.id,
                      preferredFile?.id,
                      instanceName,
                      gameVersion,
                      true,
                      p => {
                        if (parseInt(p, 10) !== prev) {
                          prev = parseInt(p, 10);
                          ipcRenderer.invoke(
                            'update-progress-bar',
                            parseInt(p, 10) / 100
                          );
                        }
                      }
                    )
                  );
                  ipcRenderer.invoke('update-progress-bar', 0);
                  setLoading(false);
                }}
                loading={loading}
              >
                Install
              </Button>
            </div>
          )
        ) : (
          <Button
            type="primary"
            onClick={() => {
              dispatch(
                openModal('ModOverview', {
                  gameVersion,
                  projectID: item.id,
                  ...(isInstalled && { fileID: isInstalled.fileID }),
                  ...(isInstalled && { fileName: isInstalled.fileName }),
                  instanceName
                })
              );
            }}
          >
            Change version / explore
          </Button>
        )}
      </RowContainer>
    );
  });

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={itemCount !== 0 ? itemCount : 40}
      loadMoreItems={() => loadMoreItems(searchQuery)}
      threshold={20}
    >
      {({ onItemsRendered, ref }) => (
        <List
          ref={ref}
          height={height}
          width={width}
          isNextPageLoading={isNextPageLoading}
          items={items}
          itemData={itemData}
          itemCount={itemCount !== 0 ? itemCount : 40}
          itemSize={80}
          onItemsRendered={onItemsRendered}
          innerElementType={innerElementType}
        >
          {Row}
        </List>
      )}
    </InfiniteLoader>
  );
};

const createItemData = memoize(
  (
    items,
    instanceName,
    gameVersion,
    installedMods,
    instance,
    isNextPageLoading
  ) => ({
    items,
    instanceName,
    gameVersion,
    installedMods,
    instance,
    isNextPageLoading
  })
);

let lastRequest;
const ModsBrowser = ({ instanceName, gameVersion }) => {
  const itemsNumber = 63;

  const [mods, setMods] = useState([]);
  const [areModsLoading, setAreModsLoading] = useState(true);
  const [filterType, setFilterType] = useState('Featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState(false);
  const instance = useSelector(state => _getInstance(state)(instanceName));

  const installedMods = instance?.mods;

  const loadMoreModsDebounced = useDebouncedCallback(
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
    if (!areModsLoading) {
      setAreModsLoading(true);
    }

    if (reset && (mods.length !== 0 || hasNextPage)) {
      setMods([]);
      setHasNextPage(false);
    }

    const isReset = reset !== undefined ? reset : false;
    let data = null;
    try {
      if (error) {
        setError(false);
      }
      ({ data } = await getSearch(
        'mods',
        searchP,
        itemsNumber,
        isReset ? 0 : mods.length,
        filterType,
        filterType !== 'Author' && filterType !== 'Name',
        gameVersion,
        getPatchedInstanceType(instance) === FABRIC ? 4780 : null
      ));
    } catch (err) {
      setError(err);
    }

    const newMods = reset ? data : mods.concat(data);
    if (lastRequest === reqObj) {
      setAreModsLoading(false);
      setHasNextPage((newMods || []).length % itemsNumber === 0);
      setMods(newMods || []);
    }
  };

  const itemData = createItemData(
    mods,
    instanceName,
    gameVersion,
    installedMods,
    instance,
    areModsLoading
  );

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
              loadMoreModsDebounced.callback(e.target.value, true);
            }}
            allowClear
          />
        </Header>

        {!error ? (
          !areModsLoading && mods.length === 0 ? (
            <div
              css={`
                margin-top: 120px;
                display: flex;
                flex-direction: column;
                align-items: center;
                font-size: 150px;
              `}
            >
              <FontAwesomeIcon icon={faExclamationCircle} />
              <div
                css={`
                  font-size: 20px;
                  margin-top: 70px;
                `}
              >
                No mods has been found with the current filters.
              </div>
            </div>
          ) : (
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
                  itemData={itemData}
                />
              )}
            </AutoSizer>
          )
        ) : (
          <div
            css={`
              margin-top: 120px;
              display: flex;
              flex-direction: column;
              align-items: center;
              font-size: 150px;
            `}
          >
            <FontAwesomeIcon icon={faBomb} />
            <div
              css={`
                font-size: 20px;
                margin-top: 70px;
              `}
            >
              An error occurred while loading the mods list...
            </div>
          </div>
        )}
      </Container>
    </Modal>
  );
};

export default memo(ModsBrowser);

const ModsLoader = memo(
  ({ width, top, isNextPageLoading, hasNextPage, loadNextPage }) => {
    const ContextTheme = useContext(ThemeContext);

    useEffect(() => {
      if (hasNextPage && isNextPageLoading) {
        loadNextPage();
      }
    }, []);

    return (
      <ContentLoader
        style={{
          width: width - 10,
          height: '80px',
          paddingTop: 8,
          position: 'absolute',
          top
        }}
        speed={2}
        foregroundColor={ContextTheme.palette.grey[900]}
        backgroundColor={ContextTheme.palette.grey[800]}
        title={false}
      >
        <rect x="0" y="0" width="100%" height="70px" />
      </ContentLoader>
    );
  }
);

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
