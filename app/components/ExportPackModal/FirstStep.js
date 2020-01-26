import React from 'react';
import path from 'path';
import { Button, Checkbox } from 'antd';
import ContinueButton from './ContinueButton';

import styles from './ExportPackModal.scss';

export default function FirstStep(props) {
  return (
    <div className={styles.container}>
      <div className={styles.centeredDiv}>
        <div>
          <h2>Where do you want to save the exported zip pack?</h2>
          <Button
            type="primary"
            onClick={props.showFileDialog}
            className={styles.selectFolderBtn}
          >
            {props.filePath === null
              ? 'Select Folder'
              : path.basename(props.filePath).length >= 24
              ? `${path.basename(props.filePath).substr(0, 24)}...`
              : path.basename(props.filePath)}
          </Button>
        </div>
        <div>
          <h2>What is the pack version number going to be?</h2>
          <label>
            <input type="text" name="inputPackVersion" defaultValue={props.packVersion} style={{color: "black"}} onChange={e => props.setPackVersion(e.target.value)} />
          </label>
        </div>
      </div>
      <ContinueButton
        filePath={props.filePath}
        setActualStep={props.setActualStep}
      />
    </div>
  );
}
