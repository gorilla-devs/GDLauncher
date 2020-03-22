/* eslint-disable */
import React, { useState } from "react";
import styled from "styled-components";
import path from "path";
import fse from "fs-extra";
import { promises as fs } from "fs";
import { extractFull } from "node-7z";
import { get7zPath } from "../../../app/desktop/utils";
import { ipcRenderer } from "electron";
import { Button, Input } from "antd";
import { _getTempPath } from "../../utils/selectors";
import { useSelector } from "react-redux";
import { getAddon } from "../../api";
import { downloadFile } from "../../../app/desktop/utils/downloader";

const Import = ({
  setModpack,
  setVersion,
  importZipPath,
  setImportZipPath,
  setOverrideNextStepOnClick
}) => {
  const tempPath = useSelector(_getTempPath);
  const [progress, setProgress] = useState(0);
  const openFileDialog = async () => {
    const dialog = await ipcRenderer.invoke("openFileDialog");
    if (dialog.canceled) return;
    setImportZipPath(dialog.filePaths[0]);
  };

  const onClick = async () => {
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
    const isUrlRegex = urlRegex.test(importZipPath);

    const tempFilePath = path.join(tempPath, path.basename(importZipPath));

    if (isUrlRegex) {
      try {
        await fs.access(tempFilePath);
      } catch {
        await fse.remove(tempFilePath);
      }
      try {
        await downloadFile(tempFilePath, importZipPath);
      } catch (err) {
        console.error(err);
      }
    }

    const sevenZipPath = await get7zPath();
    try {
      await fs.access(path.join(tempPath, "manifest.json"));
    } catch {
      await fse.remove(path.join(tempPath, "manifest.json"));
    }
    const extraction = extractFull(
      isUrlRegex ? tempFilePath : importZipPath,
      tempPath,
      {
        recursive: true,
        $bin: sevenZipPath,
        yes: true,
        $cherryPick: "manifest.json",
        $progress: true
      }
    );
    await new Promise((resolve, reject) => {
      extraction.on("progress", ({ percent }) => {
        if (progress !== percent) setProgress(percent);
      });
      extraction.on("end", () => {
        setProgress(100);
        resolve();
      });
      extraction.on("error", err => {
        reject(err.stderr);
      });
    });
    const manifest = await fse.readJson(path.join(tempPath, "manifest.json"));
    await fse.remove(path.join(tempPath, "manifest.json"));
    const { data: addon } = await getAddon(manifest.projectID);
    setModpack(addon);
    setVersion([
      "twitchModpack",
      addon.id,
      addon.latestFiles[addon.latestFiles.length - 1].id
    ]);
    setImportZipPath(tempFilePath);
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
            placeholder="http://"
            value={importZipPath}
            onChange={e => setImportZipPath(e.target.value)}
            css={`
              width: 400px;
              margin-right: 10px;
            `}
          />
          <Button type="primary" onClick={openFileDialog}>
            Browse
          </Button>
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
