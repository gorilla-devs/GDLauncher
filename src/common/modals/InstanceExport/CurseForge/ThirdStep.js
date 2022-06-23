import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ipcRenderer } from 'electron';
import { Button } from 'antd';
import path from 'path';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import fse from 'fs-extra';
import { add as add7z } from 'node-7z';
import makeDir from 'make-dir';
import { Transition } from 'react-transition-group';
import styled from 'styled-components';
import pMap from 'p-map';
import { get7zPath } from '../../../../app/desktop/utils';
import { FABRIC, VANILLA, FORGE } from '../../../utils/constants';
import { getAddon } from '../../../api';

/**
 *
 * @param {String} archiveName Name of archive without file extension.
 * @param {String} zipDestPath Destination path (cwd of 7z).
 * @param {Array} filesArray Array of files to include. Relative to current working directory unless full path is passed for each file.
 */
const createZip = async (archiveName, zipDestPath, filesArray) => {
  const sevenZipPath = await get7zPath();
  const zipCreation = add7z(
    path.join(zipDestPath, `${archiveName}.zip`),
    filesArray,
    {
      $bin: sevenZipPath,
      $raw: ['-tzip'],
      $spawnOptions: { cwd: zipDestPath, shell: true }
    }
  );
  await new Promise((resolve, reject) => {
    zipCreation.on('end', () => {
      resolve();
    });
    zipCreation.on('error', err => {
      reject(err.stderr);
    });
  });
};

export default function ThirdStep({
  instanceName,
  instancesPath,
  instanceConfig,
  filePath, // Destionation path for zip
  packVersion,
  tempPath,
  packAuthor,
  selectedFiles,
  closeModal,
  packZipName,
  inProp,
  page
}) {
  const [isCompleted, setIsCompleted] = useState(false);
  const { loader, mods } = instanceConfig;
  const mcVersion = loader?.mcVersion;
  const modloaderName = loader?.loaderType;
  const dispatch = useDispatch();
  const tempExport = path.join(tempPath, instanceName);

  const openExportLocation = async () => {
    await ipcRenderer.invoke('openFolder', filePath);
  };

  // Construct manifest contents
  const createManifest = async (modsArray = mods) => {
    let loaderObj = {};
    switch (modloaderName) {
      case FORGE:
        loaderObj = {
          id: `${modloaderName}-${loader?.loaderVersion.slice(
            mcVersion.length + 1
          )}`,
          primary: true
        };
        break;
      case FABRIC:
        loaderObj = {
          id: `${modloaderName}-${loader?.loaderVersion}`,
          loader: loader?.fileID,
          primary: true
        };
        break;
      case VANILLA:
        loaderObj = {
          id: modloaderName,
          primary: true
        };
        break;
      default:
        throw new Error(
          `Unknown loader type. Cannot export modloaderName: ${modloaderName}`
        );
    }

    return {
      minecraft: {
        version: mcVersion,
        modLoaders: [loaderObj]
      },
      manifestType: 'minecraftModpack',
      overrides: 'overrides',
      manifestVersion: 1,
      version: packVersion,
      author: packAuthor,
      projectID:
        modloaderName === 'forge' && loader.length > 3
          ? parseInt(loader?.fileID, 10)
          : undefined,
      name: packZipName,
      files: modsArray
        .filter(mod => mod?.projectID)
        .map(mod => ({
          projectID: mod.projectID,
          fileID: mod.fileID,
          required: true
        }))
    };
  };

  const createModListHtml = async () => {
    const mappedMods = await Promise.all(
      mods
        .filter(mod => mod.projectID)
        .map(async mod => {
          let ok = false;
          let tries = 0;

          do {
            try {
              tries += 1;
              if (tries !== 1) {
                await new Promise(resolve => setTimeout(resolve, 5000));
              }
              const data = await getAddon(mod.projectID);

              ok = true;
              return {
                name: data.name,
                url: data.websiteUrl,
                author: data.authors[0].name
              };
            } catch (e) {
              console.error(e);
            }
          } while (!ok && tries <= 3);
        })
    );

    return `<ul>${mappedMods
      .map(
        mod => `<li><a href=${mod?.url}>${mod?.name}(${mod?.author})</a></li>`
      )
      .join('')}</ul>`;
  };

  useEffect(() => {
    if (page !== 2) return;
    const workOnFiles = async () => {
      // Make sure mod with curseforge ids gets removed from mods folder if included.
      const filteredFiles = mods
        ? selectedFiles.filter(file => {
            const match = mods.find(
              mod => mod.fileName === path.basename(file)
            );
            if (match && match.projectID) return false;
            return true;
          })
        : selectedFiles;

      // Filter only selected curseforge mods for use in manifest.
      const filteredCurseforgeMods = mods
        ? mods.filter(mod => {
            const match = selectedFiles.find(
              file => mod.fileName === path.basename(file)
            );
            if (match && mod.projectID) return true;
            return false;
          })
        : selectedFiles;

      // Process files from selection
      await makeDir(path.join(tempExport, 'overrides'));

      await pMap(
        filteredFiles,
        async file => {
          const stats = await fse.stat(file);
          if (stats.isFile()) {
            const slicedFile = file.slice(
              path.join(instancesPath, instanceName).length + 1
            );
            try {
              await fse.ensureLink(
                file,
                path.join(tempExport, 'overrides', slicedFile)
              );
            } catch {
              await fse.copy(
                file,
                path.join(tempExport, 'overrides', slicedFile)
              );
            }
          }
        },
        { concurrency: 3 }
      );

      // Create manifest file
      const manifestPath = path.join(path.join(tempExport, 'manifest.json'));
      const manifestString = await createManifest(filteredCurseforgeMods);
      await fse.outputJson(manifestPath, manifestString);

      // Create modlist.html file
      const modlistHtmlPath = path.join(path.join(tempExport, 'modlist.html'));
      const modlistHtmlContent = await createModListHtml();
      await fse.writeFile(modlistHtmlPath, modlistHtmlContent);

      // Create zipped export file
      const filesToZip = [
        path.join(tempExport, 'modlist.html'),
        path.join(tempExport, 'overrides'),
        path.join(tempExport, 'manifest.json')
      ];

      await fse.remove(
        path.join(filePath, `${packZipName}-${packVersion}.zip`)
      );
      await createZip(`${packZipName}-${packVersion}`, filePath, filesToZip);

      // Clean up temp folder
      await fse.remove(tempExport);

      setIsCompleted(true);
    };

    workOnFiles();
  }, [page]);

  return (
    <Transition in={inProp} timeout={200}>
      {state => (
        <Animation state={state}>
          <div
            css={`
              width: 100%;
              height: calc(100% - 40px);
              display: flex;
              margin: 20px;
            `}
          >
            <div
              css={`
                flex: 5;
                height: 100%;
              `}
            >
              <div
                css={`
                  height: 85%;
                  width: 100%;
                  padding: 20px;
                  overflow-y: auto;
                `}
              >
                <div
                  css={`
                    display: flex;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                    align-items: center;
                    text-align: center;
                  `}
                >
                  {isCompleted ? (
                    <div>
                      <h1>
                        All Done!{' '}
                        <FontAwesomeIcon
                          icon={faCheck}
                          css={`
                            color: ${props => props.theme.palette.colors.green};
                          `}
                        />
                      </h1>
                      <div>
                        <Button
                          type="primary"
                          onClick={openExportLocation}
                          css={`
                            margin-top: 20px;
                          `}
                        >
                          Open Export Location
                        </Button>
                      </div>
                      <div>
                        <Button
                          type="primary"
                          onClick={() => dispatch(closeModal())}
                          css={`
                            margin-top: 20px;
                          `}
                        >
                          Go Back To Instances
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <h2>We&apos;re doing some magical stuff</h2>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Animation>
      )}
    </Transition>
  );
}

const Animation = styled.div`
  transition: 0.2s ease-in-out;
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 100000;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  will-change: transform;
  transform: translateX(
    ${({ state }) => (state === 'exiting' || state === 'exited' ? 100 : 0)}%
  );
`;
