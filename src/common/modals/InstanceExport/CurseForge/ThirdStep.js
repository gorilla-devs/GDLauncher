import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from 'antd';
import path from 'path';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import fse from 'fs-extra';
import makeDir from 'make-dir';
import { Transition } from 'react-transition-group';
import styled from 'styled-components';
import pMap from 'p-map';
import { FABRIC, VANILLA, FORGE } from '../../../utils/constants';
import EV from '../../../messageEvents';
import sendMessage from '../../../utils/sendMessage';

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
  const { modloader, mods } = instanceConfig;
  const mcVersion = modloader[1];
  const modloaderName = modloader[0];
  const dispatch = useDispatch();
  const tempExport = path.join(tempPath, instanceName);

  // Construct manifest contents
  const createManifest = async (modsArray = mods) => {
    let loader = {};
    switch (modloaderName) {
      case FORGE:
        loader = {
          id: `${modloaderName}-${modloader[2].slice(mcVersion.length + 1)}`,
          primary: true
        };
        break;
      case FABRIC:
        loader = {
          id: modloaderName,
          yarn: modloader[2],
          loader: modloader[3],
          primary: true
        };
        break;
      case VANILLA:
        loader = {
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
        modLoaders: [loader]
      },
      manifestType: 'minecraftModpack',
      overrides: 'overrides',
      manifestVersion: 1,
      version: packVersion,
      author: packAuthor,
      projectID:
        modloaderName === 'forge' && modloader.length > 3
          ? parseInt(modloader[3], 10)
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

      // Create zipped export file
      const filesToZip = [
        path.join(tempExport, 'overrides'),
        path.join(tempExport, 'manifest.json')
      ];

      await fse.remove(
        path.join(filePath, `${packZipName}-${packVersion}.zip`)
      );
      await sendMessage(EV.CREATE_EXTRACT_ZIP, [
        `${packZipName}-${packVersion}`,
        filePath,
        filesToZip
      ]);

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
