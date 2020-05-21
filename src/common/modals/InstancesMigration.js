/* eslint-disable react/no-unescaped-entities */
import React, { memo, useEffect, useState } from 'react';
import styled from 'styled-components';
import { ipcRenderer } from 'electron';
import { promises as fs } from 'fs';
import path from 'path';
import pMap from 'p-map';
import fse from 'fs-extra';
import makeDir from 'make-dir';
import { useSelector, useDispatch } from 'react-redux';
import { LoadingOutlined } from '@ant-design/icons';
import Modal from '../components/Modal';
import {
  _getInstancesPath,
  _getDownloadQueue,
  _getCurrentDownloadItem
} from '../utils/selectors';
import { addToQueue } from '../reducers/actions';
import { closeModal } from '../reducers/modals/actions';
import Logo from '../../ui/Logo';

const InstancesMigration = () => {
  const dispatch = useDispatch();
  const forgeVersions = useSelector(state => state.app.forgeManifest);
  const instancesPath = useSelector(_getInstancesPath);
  const downloadQueue = useSelector(_getDownloadQueue);
  const currentDownloadItem = useSelector(_getCurrentDownloadItem);
  const [totalInstances, setTotalInstances] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [copiedFiles, setCopiedFiles] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [copying, setCopying] = useState(false);

  const getOldInstances = async () => {
    const oldLauncherUserData = await ipcRenderer.invoke(
      'getOldLauncherUserData'
    );
    const files = await fs.readdir(path.join(oldLauncherUserData, 'packs'));
    const instances = (
      await Promise.all(
        files.map(async f => {
          try {
            const stat = await fs.stat(
              path.join(oldLauncherUserData, 'packs', f)
            );

            if (stat.isDirectory()) {
              const config = await fse.readJSON(
                path.join(oldLauncherUserData, 'packs', f, 'config.json')
              );

              const isForgeOk = config?.forgeVersion
                ? forgeVersions[config?.version].find(v =>
                    v.includes(config?.forgeVersion.replace('forge-', ''))
                  )
                : true;

              return config.version && isForgeOk ? f : null;
            }
            return null;
          } catch {
            return null;
          }
        })
      )
    ).filter(v => v);
    return instances;
  };

  useEffect(() => {
    const migrateOldLauncherInstances = async () => {
      const oldLauncherUserData = await ipcRenderer.invoke(
        'getOldLauncherUserData'
      );
      const instances = await getOldInstances();
      setTotalInstances(instances.length);

      await pMap(
        instances,
        async instance => {
          await new Promise(resolve => setTimeout(resolve, 300));
          const config = await fse.readJSON(
            path.join(oldLauncherUserData, 'packs', instance, 'config.json')
          );

          const { version, forgeVersion, timePlayed } = config;

          if (version) {
            const instanceFiles = await fs.readdir(
              path.join(oldLauncherUserData, 'packs', instance)
            );

            setTotalFiles(v => v + instanceFiles.length);

            let icon = null;

            await Promise.all(
              instanceFiles.map(async f => {
                try {
                  const iconExts = ['png', 'jpg', 'jpeg'];
                  if (f === 'config.json') return;
                  const isIcon = iconExts.find(v => f === `thumbnail.${v}`);
                  if (isIcon) {
                    await makeDir(path.join(instancesPath, instance));
                    await fse.copy(
                      path.join(oldLauncherUserData, 'packs', instance, f),
                      path.join(instancesPath, instance, `icon.${isIcon}`)
                    );
                    icon = `icon.${isIcon}`;
                  }
                } catch (error) {
                  console.error(error);
                }
                return null;
              })
            );

            dispatch(
              addToQueue(
                instance,
                [
                  forgeVersion ? 'forge' : 'vanilla',
                  version,
                  ...(forgeVersion
                    ? [
                        `${forgeVersions[version].find(v =>
                          v.includes(forgeVersion.replace('forge-', ''))
                        )}`
                      ]
                    : [])
                ],
                null,
                icon,
                timePlayed
              )
            );
          }
        },
        { concurrency: 1 }
      );
      setInitialized(true);
    };

    migrateOldLauncherInstances();
  }, []);

  useEffect(() => {
    if (!initialized || Object.keys(downloadQueue).length !== 0) return;
    const copyInstanceFiles = async () => {
      setCopying(true);
      const oldLauncherUserData = await ipcRenderer.invoke(
        'getOldLauncherUserData'
      );
      const instances = await getOldInstances();
      await pMap(
        instances,
        async instance => {
          const instanceFiles = await fs.readdir(
            path.join(oldLauncherUserData, 'packs', instance)
          );

          await Promise.all(
            instanceFiles.map(async f => {
              try {
                const iconExts = ['png', 'jpg', 'jpeg'];
                const isIcon = iconExts.find(v => f === `thumbnail.${v}`);
                if (f === 'config.json' || isIcon || f === 'natives') return;
                await fse.copy(
                  path.join(oldLauncherUserData, 'packs', instance, f),
                  path.join(
                    instancesPath,
                    instance,
                    isIcon ? `icon.${isIcon}` : f
                  )
                );
                setCopiedFiles(v => v + 1);
              } catch (error) {
                console.error(error);
              }
              return null;
            })
          );
        },
        { concurrency: 1 }
      );
      setCopying(false);
      dispatch(closeModal());
    };
    copyInstanceFiles();
  }, [currentDownloadItem, downloadQueue]);

  return (
    <Modal
      css={`
        height: 500px;
        width: 550px;
      `}
      title="Instances Migration"
      header={false}
    >
      <Container>
        <div
          css={`
            margin-top: 20px;
          `}
        >
          <Logo size={100} />
        </div>
        <div
          css={`
            margin-top: 20px;
          `}
        >
          Importing {totalInstances} Instances -{' '}
          {Object.keys(downloadQueue).length} Left
        </div>
        <div
          css={`
            margin-top: 20px;
            font-size: 20px;
            color: ${props => props.theme.palette.text.secondary};
          `}
        >
          Please, do NOT close GDLauncher.
        </div>
        <div
          css={`
            margin-top: 80px;
            font-size: 20px;
            color: ${props => props.theme.palette.text.secondary};
          `}
        >
          {!copying
            ? `${currentDownloadItem?.status} ${currentDownloadItem?.percentage}%`
            : `Copying files... ${parseInt(
                (copiedFiles * 100) / totalFiles,
                10
              )}%`}
        </div>
        <div
          css={`
            display: flex;
            justify-content: center;
            width: 100%;
            font-size: 50px;
            margin-top: 50px;
          `}
        >
          <LoadingOutlined />
        </div>
      </Container>
    </Modal>
  );
};

export default memo(InstancesMigration);

const Container = styled.div`
  width: 100%;
  height: 100%;
  font-size: 30px;
  text-align: center;
`;
