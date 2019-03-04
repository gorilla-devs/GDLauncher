import React, { useEffect, useState } from 'react';
import yazl from 'yazl';
import fs from 'fs';
import { Icon, Button } from 'antd';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import path from 'path';
import axios from 'axios';
import { promisify } from 'util';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Promise from 'bluebird';
import BackButton from './BackButton';
import styles from './ExportPackModal.scss';
import { PACKS_PATH } from '../../constants';
import { getAddon } from '../../utils/cursemeta';

const ThirdStep = props => {
  const [isCompleted, setIsCompleted] = useState(false);
  const { filePath, instanceName } = props;
  useEffect(() => {
    workOnFiles();
  }, []);
  const workOnFiles = async () => {
    const installedMods = JSON.parse(
      await promisify(fs.readFile)(
        path.join(PACKS_PATH, instanceName, 'config.json')
      )
    ).mods;
    const filteredFiles = props.selectedFiles.filter(
      file =>
        !installedMods.find(
          installedMod => installedMod.fileNameOnDisk === path.basename(file)
        )
    );
    const zipFile = new yazl.ZipFile();
    zipFile.outputStream
      .pipe(fs.createWriteStream(path.join(filePath, `${instanceName}.zip`)))
      .on('close', () => {
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
              'overrides',
              path.relative(path.join(PACKS_PATH, instanceName), file)
            )
          );
      },
      { concurrency: 30 }
    );
    const manifest = await createManifest();
    zipFile.addBuffer(Buffer.from(manifest, 'utf8'), 'manifest.json');
    zipFile.end();
  };

  const createManifest = async () => {
    const config = JSON.parse(
      await promisify(fs.readFile)(
        path.join(PACKS_PATH, instanceName, 'config.json')
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
      manifestType: 'minecraftModpack',
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
    <div className={styles.container}>
      <div className={styles.centeredDiv}>
        {isCompleted ? (
          <div>
            <h2>
              All Done!{' '}
              <FontAwesomeIcon icon="check" style={{ color: '#27ae60' }} />
            </h2>
            <Button type="primary" onClick={() => props.setUnMount(true)}>
              Go Back To Instances
            </Button>
          </div>
        ) : (
          <h2>
            We're doing some magical stuff <Icon type="loading" />
          </h2>
        )}
      </div>
    </div>
  );
};

function mapStateToProps(state) {
  return {
    username: state.auth.displayName
  };
}

export default connect(mapStateToProps)(ThirdStep);
