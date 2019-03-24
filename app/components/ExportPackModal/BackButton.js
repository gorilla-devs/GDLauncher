import React from 'react';
import { Button } from 'antd';
import styles from './ExportPackModal.scss';

export default props => {
  return (
    <Button
      className={styles.backBtn}
      type="primary"
      onClick={() => props.setActualStep(s => s - 1)}
    >
      Back
    </Button>
  );
};
