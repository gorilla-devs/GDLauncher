/* eslint-disable */
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import path from 'path';
import fse from 'fs-extra';
import { promises as fs } from 'fs';
import { extractAll } from '../../../app/desktop/utils';
import { ipcRenderer } from 'electron';
import { Button, Input } from 'antd';
import { _getTempPath } from '../../utils/selectors';
import { useSelector } from 'react-redux';
import { getAddon } from '../../api';
import { downloadFile } from '../../../app/desktop/utils/downloader';
import { CURSEFORGE, FABRIC, FORGE, VANILLA } from '../../utils/constants';
import { transparentize } from 'polished';

const Import = ({
  setModpack,
  setVersion,
  importZipPath,
  setImportZipPath,
  setOverrideNextStepOnClick
}) => {
  const [localValue, setLocalValue] = useState(null);
  const tempPath = useSelector(_getTempPath);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [importZipPath]);

  useEffect(() => {
    setImportZipPath(localValue?.length > 0 ? localValue : null);
    setVersion(null);
  }, [localValue]);

  const openFileDialog = async () => {
    const dialog = await ipcRenderer.invoke('openFileDialog');
    if (dialog.canceled) return;
    setLocalValue(dialog.filePaths[0]);
  };

  const onClick = async () => {
    if (loading || !localValue) return;
    setLoading(true);
    const urlRegex =
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*).zip$/;
    const isUrlRegex = urlRegex.test(localValue);

    const tempFilePath = path.join(tempPath, path.basename(localValue));

    if (isUrlRegex) {
      try {
        await fs.access(tempFilePath);
      } catch {
        await fse.remove(tempFilePath);
      }
      try {
        await downloadFile(tempFilePath, localValue);
      } catch (err) {
        console.error(err);
        setError(true);
        setLoading(false);
        throw err;
      }
    }

    try {
      await fs.access(path.join(tempPath, 'manifest.json'));
    } catch {
      await fse.remove(path.join(tempPath, 'manifest.json'));
    }
    await extractAll(
      isUrlRegex ? tempFilePath : localValue,
      tempPath,
      {
        recursive: true,
        yes: true,
        $cherryPick: 'manifest.json'
      },
      {
        error: () => {
          setError(true);
          setLoading(false);
        }
      }
    );
    const manifest = await fse.readJson(path.join(tempPath, 'manifest.json'));
    await fse.remove(path.join(tempPath, 'manifest.json'));
    let addon = null;

    if (manifest.projectID) {
      const data = await getAddon(manifest.projectID);
      addon = data;
      setModpack(addon);
    } else {
      setModpack({ name: manifest.name, logo: null });
    }
    const isForge = (manifest?.minecraft?.modLoaders || []).find(
      v => v.id.includes(FORGE) && v.primary
    );

    const isFabric = (manifest?.minecraft?.modLoaders || []).find(
      v => v.id.includes(FABRIC) && v.primary
    );

    const isVanilla = (manifest?.minecraft?.modLoaders || []).find(
      v => v.id.includes(VANILLA) && v.primary
    );

    if (!isForge && !isFabric && !isVanilla) {
      setError(true);
      setLoading(false);
      return;
    }

    const loader = { loaderType: VANILLA };

    if (manifest.manifestType === 'minecraftModpack') {
      loader.source = CURSEFORGE;
    }

    if (isForge) loader.loaderType = FORGE;
    else if (isFabric) loader.loaderType = FABRIC;

    if (manifest.projectID) {
      loader.projectID = manifest.projectID;
    }

    setVersion(loader);
    if (isUrlRegex) {
      setImportZipPath(tempFilePath);
    }
    setLoading(false);
    setError(false);
  };

  setOverrideNextStepOnClick(() => onClick);

  return (
    <Container>
      <div>
        Local file or link to a direct download
        <div
          css={`
            display: flex;
            margin-top: 20px;
          `}
        >
          <Input
            disabled={loading}
            placeholder="http://.../file.zip"
            value={localValue}
            onChange={e => setLocalValue(e.target.value)}
            css={`
              width: 400px !important;
              margin-right: 10px !important;
            `}
          />
          <Button disabled={loading} type="primary" onClick={openFileDialog}>
            Browse
          </Button>
        </div>
        <div
          show={error}
          css={`
            opacity: ${props => (props.show ? 1 : 0)};
            color: ${props => props.theme.palette.error.main};
            font-weight: 700;
            font-size: 14px;
            padding: 3px;
            height: 30px;
            margin-top: 10px;
            text-align: center;
            border-radius: ${props => props.theme.shape.borderRadius};
            background: ${props =>
              transparentize(0.7, props.theme.palette.grey[700])};
          `}
        >
          {error && 'There was an issue while importing.'}
        </div>
      </div>
    </Container>
  );
};

export default React.memo(Import);

const Container = styled.div`
  width: 100%;
  height: 80%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin-top: 30px;
`;
