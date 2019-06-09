import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import ContentLoader from 'react-content-loader';
import fs from 'fs';
import path from 'path';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faChevronLeft} from '@fortawesome/free-solid-svg-icons';
import Promise from 'bluebird';
import AutoSizer from 'react-virtualized-auto-sizer';
import { promisify } from 'util';
import _ from 'lodash';
import { Button, Select, Icon } from 'antd';
import { PACKS_PATH } from '../../../../constants';
import { downloadMod, downloadDependancies } from '../../../../utils/mods';

import styles from './ModPage.scss';
import { getAddon, getAddonFiles, getAddonDescription } from '../../../../utils/cursemeta';

function ModPage(props) {
  const [modData, setModData] = useState(null);
  const [modsInstalling, setModsInstalling] = useState([]);
  const [selectedModVersion, setSelectedModVersion] = useState(null);
  useEffect(() => {
    getAddonData(props.mod);
  }, []);

  const installMod = async (id, projectFileId, filename) => {
    setModsInstalling({
      ...modsInstalling,
      [filename]: { installing: true, completed: false }
    });

    const newMod = await downloadMod(
      id,
      projectFileId,
      filename,
      props.instance
    );
    const dependancies = await downloadDependancies(
      id,
      projectFileId,
      props.instance
    );
    try {
      const config = JSON.parse(
        await promisify(fs.readFile)(
          path.join(PACKS_PATH, props.instance, 'config.json')
        )
      );
      await promisify(fs.writeFile)(
        path.join(PACKS_PATH, props.instance, 'config.json'),
        JSON.stringify({
          ...config,
          mods: [...config.mods, newMod, ...dependancies]
        })
      );
    } catch {}

    setModsInstalling({
      ...modsInstalling,
      [filename]: { installing: false, completed: true }
    });
  };

  const getAddonData = async addon => {
    const [data, files, description] = await Promise.all([
      getAddon(addon),
      getAddonFiles(addon),
      getAddonDescription(addon)
    ]);

    const filteredFiles = files.filter(el =>
      el.gameVersion.includes(props.version)
    );

    setModData({
      ...data,
      description,
      allFiles: _.orderBy(filteredFiles, ['fileDate'], ['desc']),
    });
  };

  const isDownloadCompleted = data =>
    modsInstalling[data] && modsInstalling[data].completed;

  const isInstalling = data =>
    modsInstalling[data] && modsInstalling[data].installing;

  const handleModVersionChange = version => setSelectedModVersion(version);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '800px',
        height: 'calc(100% + 60px)',
        marginTop: -40,
        padding: '10px 10px 10px 30px',
        position: 'absolute',
        background: 'var(--secondary-color-1)',
        overflow: 'auto'
      }}
    >
      <div className={styles.backBtn} onClick={props.goBack}>
        <FontAwesomeIcon icon={faChevronLeft} />
      </div>
      {!modData ? (
        <AutoSizer>
          {({ height, width }) => (
            <ContentLoader
              height={height - 60}
              width={width}
              speed={0.6}
              ariaLabel={false}
              primaryColor="var(--secondary-color-2)"
              secondaryColor="var(--secondary-color-3)"
              style={{
                height: height - 60,
                width,
                marginTop: 20,
                marginLeft: 10
              }}
            >
              <rect x="100" y="10" rx="0" ry="0" width={320} height="20" />
              <rect x="10" y="70" rx="0" ry="0" width={480} height="30" />
              <rect x="10" y="110" rx="0" ry="0" width={480} height="30" />
              <rect x="10" y="150" rx="0" ry="0" width={480} height="30" />
              <rect x="10" y="230" rx="0" ry="0" width={50} height="50" />
              <rect x="70" y="230" rx="0" ry="0" width={420} height="17" />
              <rect x="70" y="260" rx="0" ry="0" width={420} height="17" />
              <rect x="10" y="290" rx="0" ry="0" width={480} height="17" />
              <rect x="10" y="320" rx="0" ry="0" width={480} height="17" />
            </ContentLoader>
          )}
        </AutoSizer>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ textAlign: 'center' }}>{modData.name}</h1>
          <div className={styles.modActions}>
            <div
              style={{
                width: '45%',
                display: 'flex',
                justifyContent: 'space-evenly',
                alignItems: 'center'
              }}
            >
              <Button
                type="primary"
                onClick={() =>
                  installMod(
                    modData.id,
                    modData.allFiles[0].id,
                    modData.allFiles[0].fileNameOnDisk
                  )
                }
                loading={isInstalling(modData.allFiles[0].fileNameOnDisk)}
                disabled={isDownloadCompleted(
                  modData.allFiles[0].fileNameOnDisk
                )}
              >
                Install Latest
              </Button>
            </div>
            <span>Or</span>
            <div style={{ width: '45%' }}>
              <Select
                style={{
                  width: '200px',
                  display: 'block',
                  margin: '0 auto'
                }}
                placeholder="Select a version"
                notFoundContent="No version found"
                onChange={handleModVersionChange}
              >
                {modData.allFiles.map(ver => (
                  <Select.Option
                    key={ver.fileNameOnDisk}
                    value={ver.fileNameOnDisk}
                  >
                    {ver.fileNameOnDisk}
                  </Select.Option>
                ))}
              </Select>
              <br />
              <Button
                type="primary"
                onClick={() =>
                  installMod(
                    modData.id,
                    modData.allFiles.find(
                      v => v.fileNameOnDisk === selectedModVersion
                    ).id,
                    modData.allFiles.find(
                      v => v.fileNameOnDisk === selectedModVersion
                    ).fileNameOnDisk
                  )
                }
                loading={isInstalling(selectedModVersion)}
                disabled={isDownloadCompleted(selectedModVersion)}
                style={{ display: 'block', margin: '0 auto' }}
              >
                {isInstalling(selectedModVersion)
                  ? 'Installing'
                  : isDownloadCompleted(selectedModVersion)
                  ? 'Installed'
                  : 'Install Selected Mod'}
              </Button>
            </div>
          </div>
          <h2 style={{ textAlign: 'center' }}>Description</h2>
          <div className={styles.modDescription}>
            <span
              dangerouslySetInnerHTML={{
                __html: modData.description
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function mapStateToProps(state) {
  return {};
}

export default connect(mapStateToProps)(ModPage);
