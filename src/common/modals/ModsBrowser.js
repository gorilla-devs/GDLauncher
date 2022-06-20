/* eslint-disable no-nested-ternary */
import React, { memo, useState } from 'react';
import styled from 'styled-components';
import { Radio } from 'antd';
import Modal from '../components/Modal';
import { _getInstance } from '../utils/selectors';
import { CURSEFORGE, MODRINTH } from '../utils/constants';
import CurseForgeModsBrowser from './CurseForgeModsBrowser';
import ModrinthModsBrowser from './ModrinthModsBrowser';
import curseForgeIcon from '../assets/curseforgeIcon.webp';
import modrinthIcon from '../assets/modrinthIcon.webp';

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
    const [error, setError] = useState(null);
    const curseReleaseChannel = useSelector(
      state => state.settings.curseReleaseChannel
    );
    const dispatch = useDispatch();
    const { instanceName, gameVersions, installedMods, instance } = data;

    const item = items[index];

    const isInstalled = installedMods.find(v => v.projectID === item?.id);
    const primaryImage = item?.logo;

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
              backgroundImage: `url('${primaryImage?.thumbnailUrl}')`
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
            onClick={() => {
              dispatch(
                openModal('ModOverview', {
                  gameVersions,
                  projectID: item.id,
                  ...(isInstalled && { fileID: isInstalled.fileID }),
                  ...(isInstalled && { fileName: isInstalled.fileName }),
                  instanceName
                })
              );
            }}
          >
            {item.name}
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
                  const files = await getAddonFiles(item?.id);

                  const isFabric = getPatchedInstanceType(instance) === FABRIC;
                  const isForge = getPatchedInstanceType(instance) === FORGE;

                  let filteredFiles = [];

                  if (isFabric) {
                    filteredFiles = filterFabricFilesByVersion(
                      files,
                      gameVersions
                    );
                  } else if (isForge) {
                    filteredFiles = filterForgeFilesByVersion(
                      files,
                      gameVersions
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
                      `Could not find any release candidate for addon: ${item?.id} / ${gameVersions}`
                    );
                    return;
                  }

                  let prev = 0;
                  await dispatch(
                    installMod(
                      item?.id,
                      preferredFile?.id,
                      instanceName,
                      gameVersions,
                      true,
                      p => {
                        if (parseInt(p, 10) !== prev) {
                          prev = parseInt(p, 10);
                          ipcRenderer.invoke(
                            'update-progress-bar',
                            parseInt(p, 10) / 100
                          );
                        }
                      },
                      undefined,
                      item
                    )
                  );
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
          <Button
            type="primary"
            onClick={() => {
              dispatch(
                openModal('ModOverview', {
                  gameVersions,
                  projectID: item.id,
                  ...(isInstalled && { fileID: isInstalled.fileID }),
                  ...(isInstalled && { fileName: isInstalled.fileName }),
                  instanceName
                })
              );
            }}
          >
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
    gameVersions,
    installedMods,
    instance,
    isNextPageLoading
  ) => ({
    items,
    instanceName,
    gameVersions,
    installedMods,
    instance,
    isNextPageLoading
  })
);

let lastRequest;
const ModsBrowser = ({ instanceName, gameVersions }) => {
  const [modSource, setModSource] = useState(CURSEFORGE);

  return (
    <Modal
      css={`
        height: 85%;
        width: 90%;
        max-width: 1500px;
      `}
      title="Mods Browser"
    >
      <Container>
        <Header>
          <Radio.Group
            defaultValue={CURSEFORGE}
            onChange={e => setModSource(e.target.value)}
          >
            <Radio.Button value={CURSEFORGE}>
              <img
                src={curseForgeIcon}
                css={`
                  margin-right: 4px;
                  cursor: pointer;
                  width: 20px;
                `}
              />
              CurseForge
            </Radio.Button>
            <Radio.Button value={MODRINTH}>
              <img
                src={modrinthIcon}
                css={`
                  margin-right: 4px;
                  cursor: pointer;
                  width: 20px;
                `}
              />
              Modrinth
            </Radio.Button>
          </Radio.Group>
        </Header>

        {modSource === CURSEFORGE ? (
          <CurseForgeModsBrowser
            instanceName={instanceName}
            gameVersions={gameVersions}
          />
        ) : modSource === MODRINTH ? (
          <ModrinthModsBrowser
            instanceName={instanceName}
            gameVersion={gameVersions}
          />
        ) : null}
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
