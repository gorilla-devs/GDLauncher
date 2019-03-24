import React from 'react';
import { Button } from 'antd';
import styles from './ExportPackModal.scss';

export default props => {
  if (props.filePath === null) return null;
  return (
    <Button
      className={styles.continueBtn}
      type="primary"
      onClick={() => props.setActualStep(s => s + 1)}
    >
      Continue
    </Button>
  );
};
