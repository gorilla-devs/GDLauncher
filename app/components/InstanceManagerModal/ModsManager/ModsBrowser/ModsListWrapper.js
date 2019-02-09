import React from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import ContentLoader from 'react-content-loader';
import InfiniteLoader from 'react-window-infinite-loader';

import styles from './ModsList.scss';

export default function ModsListWrapper({
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
  width,
  height,
  setClick
}) {
  // If there are more items to be loaded then add an extra row to hold a loading indicator.
  const itemCount = hasNextPage ? items.length + 3 : items.length;

  // Only load 1 page of items at a time.
  // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
  const loadMoreItems = loadNextPage;

  // Every row is loaded except for our loading indicator row.
  const isItemLoaded = index => !hasNextPage || index < items.length;

  const Cell = ({ columnIndex, rowIndex, style }) => {
    const mod = items[3 * rowIndex + columnIndex];
    let content;

    if (!isItemLoaded(3 * rowIndex + columnIndex)) {
      content = (
        <div style={style} className={styles.modIconContainer}>
          <div className={styles.overlayContainer}>
            <AutoSizer>
              {({ height, width }) => (
                <ContentLoader
                  height={height}
                  width={width}
                  speed={0.6}
                  ariaLabel={false}
                  primaryColor="var(--secondary-color-2)"
                  secondaryColor="var(--secondary-color-3)"
                  style={{
                    width,
                    height
                  }}
                >
                  <rect
                    x={0}
                    y={0}
                    rx="0"
                    ry="0"
                    width={width}
                    height={height}
                  />
                </ContentLoader>
              )}
            </AutoSizer>
          </div>
        </div>
      );
    } else {
      // Tries to find a thumbnail. If none is found, it sets a default one
      let attachment;
      try {
        attachment = mod.attachments.filter(v => v.isDefault)[0].thumbnailUrl;
      } catch {
        attachment =
          'https://www.curseforge.com/Content/2-0-6969-50/Skins/CurseForge/images/background.jpg';
      }
      content = (
        <div style={style} className={styles.modIconContainer}>
          <div className={styles.overlayContainer}>
            <div
              className={styles.modIcon}
              style={{
                background: `linear-gradient(
                  rgba(0, 0, 0, 0.8), 
                  rgba(0, 0, 0, 0.8)
                  ), url(${attachment})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              onClick={() => setClick(mod.id)}
            >
              {mod.name}
            </div>
          </div>
        </div>
      );
    }

    if (3 * rowIndex + columnIndex >= items.length && !isNextPageLoading)
      return <div />;
    return content;
  };

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={itemCount}
      loadMoreItems={loadMoreItems}
      threshold={6}
    >
      {({ onItemsRendered, ref }) => (
        <Grid
          ref={ref}
          useIsScrolling
          onItemsRendered={(gridData: Object) => {
            const useOverscanForLoading = true; //default is true

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
              //call onItemsRendered from InfiniteLoader so it can load more if needed
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
          {Cell}
        </Grid>
      )}
    </InfiniteLoader>
  );
}
