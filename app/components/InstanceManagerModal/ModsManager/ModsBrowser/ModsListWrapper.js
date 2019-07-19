import React, { useState, useEffect, memo } from 'react';
import { connect } from 'react-redux';
import { FixedSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import ContentLoader from 'react-content-loader';
import InfiniteLoader from 'react-window-infinite-loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { promisify } from 'util';
import path from 'path';
import fs, { readFile } from 'fs';
import _ from 'lodash';
import { Button } from 'antd';

import { getAddon, getAddonFiles } from '../../../../utils/cursemeta';
import { downloadMod, downloadDependancies } from '../../../../utils/mods';
import { PACKS_PATH } from '../../../../constants';

import styles from './ModsList.scss';
import { updateConfig, readConfig } from '../../../../utils/instances';
import { getInstance } from '../../../../utils/selectors';

const InstallButtonComponent = ({ mod, installedMods, instance, version }) => {
  const [isInstalling, setIsInstalling] = useState(false);

  function checkFileId(latestVersion, filteredFiles) {
    let tempArr = [];
    let versions = latestVersion.map(x => x.fileName.split(".jar")[0].split("-")[x.fileName.split(".jar")[0].split("-").length - 1]);
    if (latestVersion.length > 0) {
      tempArr = versions.map((a, i) => a.split('.').map(n => +n + 100000).join('.')).sort()
        .map(a => a.split('.').map(n => +n - 100000).join('.'));
      return [tempArr[tempArr.length - 1], latestVersion.filter(x => x.fileName.includes(tempArr[tempArr.length - 1]))[0].id];
    } else {
      return filteredFiles[0].id;
    }
  };

  function checkFileNameFromVersion(version, filteredFiles) {
    return filteredFiles.filter(x => x.fileName.split(".jar")[0].split("-")[x.fileName.split(".jar")[0].split("-").length - 1] === version)[0].fileName;
  }

  async function downloadModFunc(e, mod) {
    e.stopPropagation();
    setIsInstalling(true);


    const files = await getAddonFiles(mod.id);

    const filteredFiles = files.filter(el => el.gameVersion.includes(version));
    const latestVersion = filteredFiles.filter(x => x.fileName.split(".jar")[0].split("-")[x.fileName.split(".jar")[0].length - 1] === mod.gameVersionLatestFiles[0].projectFileName.split(".jar")[0].split("-")[x.fileName.split(".jar")[0].length - 1]);

    const fileID = checkFileId(latestVersion, filteredFiles)[1];
    const { fileName } = latestVersion.length > 0 ? checkFileNameFromVersion(checkFileId(latestVersion, filteredFiles)[0], filteredFiles) : filteredFiles[0].fileName;

    const newMod = await downloadMod(mod.id, fileID, fileName, instance);
    const dependancies = await downloadDependancies(mod.id, fileID, instance);

    const instanceCfg = await readConfig(instance);
    await updateConfig(instance, { mods: [...instanceCfg.mods, newMod, ...dependancies] })
  }

  if (!mod || installedMods.mods.find(v => v.projectID === mod.id))
    return null;

  if (isInstalling) {
    return (
      <div className={styles.modInstalling}>INSTALLING</div>
    )
  }

  return (
    <div
      className={styles.installMod}
      onClick={e => downloadModFunc(e, mod)}
    >
      INSTALL&nbsp;
        <FontAwesomeIcon icon={faDownload} />
    </div>
  );
};

const InstalledBadgeComponent = ({ mod, installedMods }) => {
  if (!mod || !installedMods.mods.find(v => v.projectID === mod.id))
    return null;

  return (
    <div className={styles.modInstalled}>INSTALLED</div>
  );
};

const CellComponent = ({ columnIndex, rowIndex, style, height, width, instance, version, items, isItemLoaded, isNextPageLoading, setClick }) => {
  if (3 * rowIndex + columnIndex >= items.length && !isNextPageLoading)
    return <div />;

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
            {mod && mod.name}
            <InstallButton mod={mod} instance={instance} version={version} />
          </div>
          <InstalledBadge mod={mod} instance={instance} />
        </div>
      </div>
    );
  }

  return content;
};

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
  width,
  height,
  setClick,
  instance,
  version
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
      loadMoreItems={loadMoreItems}
      threshold={6}
    >
      {({ onItemsRendered, ref }) => (
        <Grid
          ref={ref}
          useIsScrolling
          onItemsRendered={(gridData: Object) => {
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
          {p => <Cell
            items={items}
            height={height}
            width={width}
            version={version}
            instance={instance}
            isItemLoaded={isItemLoaded}
            isNextPageLoading={isNextPageLoading}
            setClick={setClick}
            {...p} />
          }
        </Grid>
      )}
    </InfiniteLoader>
  );
};

const mapStateToProps = (state, ownProps) => ({
  installedMods: getInstance(ownProps.instance)(state)
});

const InstalledBadge = connect(mapStateToProps)(InstalledBadgeComponent);

const InstallButton = connect(mapStateToProps)(InstallButtonComponent);


const Cell = memo(CellComponent);

export default ModsListWrapper;
