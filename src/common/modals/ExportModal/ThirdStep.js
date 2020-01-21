import React, { useEffect, useState } from "react";
import yazl from "yazl";
import fs from "fs";
import { Icon, Button } from "antd";
import { useSelector } from "react-redux";
import path from "path";
import { promisify } from "util";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import Promise from "bluebird";
import { getAddon } from "../../api";
import { _getInstancesPath, _getCurrentAccount } from "../../utils/selectors";

export default function ThirdStep(props) {
  const [isCompleted, setIsCompleted] = useState(false);
  const { filePath, instanceName } = props;
  const instancePath = useSelector(_getInstancesPath);
  const username = useSelector(_getCurrentAccount);

  const PackPath = path.join(instancePath, "packs");
  useEffect(() => {
    workOnFiles();
    console.log(username);
  }, []);
  const workOnFiles = async () => {
    const installedMods = JSON.parse(
      await promisify(fs.readFile)(
        path.join(PackPath, instanceName, "config.json")
      )
    ).mods;
    const filteredFiles = props.selectedFiles.filter(
      file =>
        !installedMods.find(
          installedMod => installedMod.fileName === path.basename(file)
        )
    );
    const zipFile = new yazl.ZipFile();
    zipFile.outputStream
      .pipe(fs.createWriteStream(path.join(filePath, `${instanceName}.zip`)))
      .on("close", () => {
        setIsCompleted(true);
      });

    await Promise.map(
      filteredFiles,
      async file => {
        const stats = await promisify(fs.stat)(file);
        if (stats.isFile())
          zipFile.addFile(
            file,
            path.join(
              "overrides",
              path.relative(path.join(PackPath, instanceName), file)
            )
          );
      },
      { concurrency: 30 }
    );
    const manifest = await createManifest();
    zipFile.addBuffer(Buffer.from(manifest, "utf8"), "manifest.json");
    zipFile.end();
  };

  const createManifest = async () => {
    const config = JSON.parse(
      await promisify(fs.readFile)(
        path.join(PackPath, instanceName, "config.json")
      )
    );
    let data = null;

    if (config.projectID) {
      data = await getAddon(config.projectID);
    }

    return JSON.stringify({
      minecraft: {
        version: config.version,
        modLoaders: [
          {
            id: config.forgeVersion,
            primary: true
          }
        ]
      },
      manifestType: "minecraftModpack",
      manifestVersion: 1,
      version: config.modpackVersion,
      author: config.projectID ? data.primaryAuthorName : props.username,
      projectID: config.projectID,
      name: instanceName,
      files: config.mods.map(mod => ({
        projectID: mod.projectID,
        fileID: mod.fileID,
        required: true
      }))
    });
  };
  return (
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
            <h2>
              All Done!{" "}
              <FontAwesomeIcon icon={faCheck} style={{ color: "#27ae60" }} />
            </h2>
            <Button type="primary" onClick={() => props.setUnMount(true)}>
              Go Back To Instances
            </Button>
          </div>
        ) : (
          <h2>
            We&#39;re doing some magical stuff <Icon type="loading" />
          </h2>
        )}
      </div>
    </div>
  );
}
