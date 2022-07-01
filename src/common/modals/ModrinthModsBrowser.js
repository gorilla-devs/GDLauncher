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
import {
  faBomb,
  faExclamationCircle,
  faWrench,
  faDownload
} from '@fortawesome/free-solid-svg-icons';
import { getModrinthSearchResults, getModrinthProjectVersions } from '../api';
import { openModal } from '../reducers/modals/actions';
import { _getInstance } from '../utils/selectors';
import { installModrinthMod } from '../reducers/actions';
import { MODRINTH } from '../utils/constants';

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
    const [error] = useState(null);
    const dispatch = useDispatch();

    const { instanceName, gameVersion, installedMods } = data;

    const item = items[index];

    const isInstalled = installedMods.find(
      v => v.projectID === item?.project_id
    );
    const iconUrl = item?.icon_url || '';

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

    const openModOverview = () => {
      dispatch(
        openModal('ModOverview', {
          modSource: MODRINTH,
          gameVersion,
          projectID: item.project_id,
          ...(isInstalled && { fileID: isInstalled.fileID }),
          ...(isInstalled && { fileName: isInstalled.fileName }),
          instanceName
        })
      );
    };

    return (
      <RowContainer
        isInstalled={isInstalled}
        style={{
          ...style,
          top: style.top + 15,
          height: style.height - 15,
          position: 'absolute',
          margin: '15px 10px',
          transition: 'height 0.2s ease-in-out'
        }}
      >
        {isInstalled && <ModInstalledIcon icon={faCheckCircle} />}
        {isInstalled && <ModsIconBg />}

        <RowInnerContainer>
          <RowContainerImg
            style={{
              backgroundImage: `url('${iconUrl}')`
            }}
          />
          <div
            css={`
              color: ${props => props.theme.palette.text.third};
              &:hover {
                color: ${props => props.theme.palette.text.primary};
              }
              transition: color 0.1s ease-in-out;
              cursor: pointer;
            `}
            onClick={openModOverview}
          >
            {item.title}
          </div>
        </RowInnerContainer>
        {!isInstalled ? (
          error || (
            <div>
              <Button
                type="primary"
                onClick={async e => {
                  setLoading(true);
                  e.stopPropagation();

                  // Get the latest compatible version and give it to the installer
                  const availableModVersions = await getModrinthProjectVersions(
                    item.project_id
                  );
                  const compatibleModVersions = availableModVersions
                    .filter(v => v.game_versions.includes(gameVersion))
                    .sort((a, b) => a.date_published - b.date_published);
                  // prioritise stable releases, fall back to unstable releases if no compatible stable releases exist
                  const latestCompatibleModVersion =
                    compatibleModVersions.find(
                      v => v.version_type === 'release'
                    ) ??
                    compatibleModVersions.find(
                      v => v.version_type === 'beta'
                    ) ??
                    compatibleModVersions.find(v => v.version_type === 'alpha');

                  if (!latestCompatibleModVersion) {
                    console.error(
                      `Failed to install "${item.title}": No compatible versions were found`
                    );
                  } else {
                    let prev = 0;
                    await dispatch(
                      installModrinthMod(
                        latestCompatibleModVersion,
                        instanceName,
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
                  }
                  ipcRenderer.invoke('update-progress-bar', 0);
                  setLoading(false);
                }}
                loading={loading}
              >
                <FontAwesomeIcon icon={faDownload} />
              </Button>
            </div>
          )
        ) : (
          <Button type="primary" onClick={openModOverview}>
            <FontAwesomeIcon icon={faWrench} />
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
          itemCount={items.length}
          itemSize={80}
          useIsScrolling
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

const ModrinthModsBrowser = ({ instanceName, gameVersion }) => {
  const [mods, setMods] = useState([]);
  const [areModsLoading, setAreModsLoading] = useState(true);
  const [filterType, setFilterType] = useState('relevance');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasNextPage, setHasNextPage] = useState(false);
  const [categoryId, setCategoryId] = useState(undefined);
  const [error, setError] = useState(false);
  const instance = useSelector(state => _getInstance(state)(instanceName));
  const categories = useSelector(state =>
    state.app.modrinthCategories
      .filter(cat => cat.project_type === 'mod')
      .map(cat => {
        return {
          id: cat.name,
          displayName: cat.name[0].toUpperCase() + cat.name.slice(1),
          icon: cat.icon
            .replace('xmlns="http://www.w3.org/2000/svg"', '')
            .replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
            .replace('currentColor', 'white')
        };
        // the SVG editing is required until Modrinth normalises the SVGs they send us
        // only some have the xmlns attribute, which is required for them to work as a data uri
      })
  );

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
  }, [filterType, categoryId]);

  useEffect(() => {
    loadMoreMods();
  }, []);

  const loadMoreMods = async (query = '', reset) => {
    const isReset = reset !== undefined ? reset : false;
    setAreModsLoading(true);
    setError(false);

    let hits;
    let totalHits;

    try {
      // this only supports filtering by 1 category, but the API supports multiple if we want to include that later
      ({ hits, total_hits: totalHits } = await getModrinthSearchResults(
        query,
        'MOD',
        gameVersion,
        [categoryId],
        filterType,
        isReset ? 0 : mods.length
      ));
    } catch (err) {
      console.error(err);
      setError(err);
    }

    const newMods = reset ? hits : [...mods, ...hits];

    setHasNextPage(newMods?.length < totalHits);
    setMods(newMods || []);
    setAreModsLoading(false);
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
    <Container>
      <Header>
        <Select
          css={`
            width: 160px !important;
            margin: 0 10px !important;
          `}
          defaultValue="relevance"
          onChange={setFilterType}
          disabled={areModsLoading}
          virtual={false}
        >
          {['Relevance', 'Downloads', 'Follows', 'Newest', 'Updated'].map(x => (
            <Select.Option key={x.toLowerCase()} value={x.toLowerCase()}>
              {x}
            </Select.Option>
          ))}
        </Select>
        <Select
          placeholder="Category"
          onChange={setCategoryId}
          defaultValue={null}
          virtual={false}
          css={`
            width: 500px !important;
            margin-right: 10px !important;
            text-transform: capitalize;
          `}
        >
          <Select.Option key={null} value={null}>
            All Categories
          </Select.Option>
          {(categories || [])
            .sort((a, b) => a.displayName.localeCompare(b.displayName))
            .map(cat => (
              <Select.Option
                value={cat.id}
                key={cat.id}
                css={`
                  text-transform: capitalize;
                `}
              >
                <div
                  css={`
                    display: flex;
                    align-items: center;
                    width: 100%;
                    height: 100%;
                  `}
                >
                  <img
                    src={`data:image/svg+xml,${cat.icon}`}
                    css={`
                      height: 16px;
                      width: 16px;
                      margin-right: 10px;
                    `}
                    alt={`${cat.displayName}icon`}
                  />
                  {cat.displayName}
                </div>
              </Select.Option>
            ))}
        </Select>
        <Input
          css={`
            height: 32px !important;
          `}
          placeholder="Search..."
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value);
            loadMoreModsDebounced(e.target.value, true);
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
                height={height - 100}
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
  );
};

export default memo(ModrinthModsBrowser);

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
          height: '62px',
          paddingTop: 8,
          position: 'absolute',
          top
        }}
        speed={2}
        foregroundColor={ContextTheme.palette.grey[900]}
        backgroundColor={ContextTheme.palette.grey[800]}
        title={false}
      >
        <rect x="0" y="0" width="100%" height="65px" />
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
