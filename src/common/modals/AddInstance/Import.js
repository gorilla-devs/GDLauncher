/* eslint-disable */
import React, { useState } from "react";
import styled from "styled-components";
import path from "path";
import fse from "fs-extra";
import { promises as fs } from "fs";
import { extractFull } from "node-7z";
import { get7zPath } from "../../../app/desktop/utils";
import { ipcRenderer } from "electron";
import { Button } from "antd";
import { _getTempPath } from "../../utils/selectors";
import { useSelector } from "react-redux";
import { getAddon } from "../../api";

const Import = ({ setModpack, setVersion, modpack, setImportZipPath }) => {
  const tempPath = useSelector(_getTempPath);
  const [zipName, setZipName] = useState(null);
  const [progress, setProgress] = useState(0);
  const openFileDialog = async () => {
    const dialog = await ipcRenderer.invoke("openFileDialog");
    if (dialog.canceled) return;
    setImportZipPath(dialog.filePaths[0]);
    setZipName(path.basename(dialog.filePaths[0]));
    const sevenZipPath = await get7zPath();
    try {
      await fs.access(path.join(tempPath, "manifest.json"));
    } catch {
      await fse.remove(path.join(tempPath, "manifest.json"));
    }
    const extraction = extractFull(dialog.filePaths[0], tempPath, {
      recursive: true,
      $bin: sevenZipPath,
      yes: true,
      $cherryPick: "manifest.json",
      $progress: true
    });
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
  };
  return (
    <Container>
      <div>
        <Button type="primary" onClick={openFileDialog}>
          {(progress !== 0 &&
            progress !== 100 &&
            `Analyzing zip... ${progress}%`) ||
            modpack?.name ||
            zipName ||
            "Select zip file"}
        </Button>
      </div>
    </Container>
  );
};

export default React.memo(Import);

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  margin-top: 30px;
`;
