import React, { forwardRef, memo, useContext, useEffect } from 'react';
import styled, { ThemeContext } from 'styled-components';
import { useDispatch } from 'react-redux';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import ContentLoader from 'react-content-loader';
import { transparentize } from 'polished';
import { openModal } from '../../../reducers/modals/actions';
import { CURSEFORGE } from '../../../utils/constants';

const ModpacksListWrapper = ({
  // Are there more items to load?
  // (This information comes from the most recent API request.)
  hasNextPage,

  // Are we currently loading a page of items?
  // (This may be an in-flight flag in your Redux store for example.)
  isNextPageLoading,

  // Array of items loaded so far.
  items,

  height,

  width,

  setStep,

  setVersion,
  // Callback function responsible for loading the next page of items.
  loadNextPage,

  setModpack,

  infiniteLoaderRef
}) => {
  const dispatch = useDispatch();
  // If there are more items to be loaded then add an extra row to hold a loading indicator.
  const itemCount = hasNextPage ? items.length + 1 : items.length;
  // Only load 1 page of items at a time.
  // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
  const loadMoreItems = isNextPageLoading ? () => {} : loadNextPage;
  // Every row is loaded except for our loading indicator row.
  const isItemLoaded = index => !hasNextPage || index < items.length;

  // Render an item or a loading indicator.
  const Item = memo(({ index, style }) => {
    const modpack = items[index];

    if (!modpack) {
      return (
        <ModpackLoader
          hasNextPage={hasNextPage}
          isNextPageLoading={isNextPageLoading}
          loadNextPage={loadNextPage}
          top={style.top + (index === 0 ? 0 : 8)}
          width={width}
          height={style.height - (index === 0 ? 0 : 8)}
        />
      );
    }

    const primaryImage = modpack.attachments.find(v => v.isDefault);
    return (
      <div
        // eslint-disable-next-line
        style={{
          ...style,
          top: style.top + (index === 0 ? 0 : 8),
          height: style.height - (index === 0 ? 0 : 8),
          background: `url('${primaryImage?.thumbnailUrl}')`,
          position: 'absolute',
          width: width - 8,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          margin: 0,
          borderRadius: 4
        }}
        key={modpack.id}
      >
        <Modpack>
          <div>{modpack.name}</div>
        </Modpack>
        <ModpackHover>
          <div
            onClick={() => {
              setVersion({
                projectID: modpack.id,
                fileID: modpack.latestFiles[modpack.latestFiles.length - 1].id,
                source: CURSEFORGE
              });
              setModpack(modpack);
              setStep(1);
            }}
          >
            Download Latest
          </div>
          <div
            onClick={() => {
              dispatch(
                openModal('ModpackDescription', {
                  modpack,
                  setVersion,
                  setModpack,
                  setStep,
                  type: 'curseforge'
                })
              );
            }}
          >
            Explore / Versions
          </div>
        </ModpackHover>
      </div>
    );
  });

  const innerElementType = forwardRef(({ style, ...rest }, ref) => (
    <div
      ref={ref}
      // eslint-disable-next-line react/forbid-dom-props
      style={{
        ...style,
        paddingTop: 0
      }}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    />
  ));

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={itemCount !== 0 ? itemCount : 40}
      loadMoreItems={() => loadMoreItems()}
    >
      {({ onItemsRendered }) => (
        <List
          height={height}
          width={width}
          itemCount={itemCount !== 0 ? itemCount : 40}
          itemSize={100}
          onItemsRendered={onItemsRendered}
          innerElementType={innerElementType}
          ref={list => {
            // Manually bind ref to reset scroll
            // eslint-disable-next-line
            infiniteLoaderRef.current = list;
          }}
        >
          {Item}
        </List>
      )}
    </InfiniteLoader>
  );
};

export default memo(ModpacksListWrapper);

const Modpack = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 20px;
  padding: 0 10px;
  font-weight: 700;
  background: ${props => transparentize(0.2, props.theme.palette.grey[700])};
`;

const ModpackHover = styled.div`
  position: absolute;
  display: flex;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${props => transparentize(0.4, props.theme.palette.grey[900])};
  opacity: 0;
  padding-left: 40%;
  will-change: opacity;
  transition: opacity 0.1s ease-in-out, background 0.1s ease-in-out;
  div {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    background-color: transparent;
    border-radius: 4px;
    transition: background-color 0.1s ease-in-out;
    &:hover {
      background-color: ${props => props.theme.palette.primary.main};
    }
  }
  &:hover {
    opacity: 1;
  }
`;

const ModpackLoader = memo(
  ({ height, width, top, isNextPageLoading, hasNextPage, loadNextPage }) => {
    const ContextTheme = useContext(ThemeContext);

    useEffect(() => {
      if (hasNextPage && isNextPageLoading) {
        loadNextPage();
      }
    }, []);
    return (
      <ContentLoader
        speed={2}
        foregroundColor={ContextTheme.palette.grey[900]}
        backgroundColor={ContextTheme.palette.grey[800]}
        title={false}
        height={height}
        style={{
          width: width - 8,
          height,
          position: 'absolute',
          margin: 0,
          padding: 0,
          top,
          borderRadius: 4
        }}
      >
        <rect x="0" y="0" width="100%" height={height} />
      </ContentLoader>
    );
  }
);
