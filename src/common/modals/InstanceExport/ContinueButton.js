import React from 'react';
import { Button } from 'antd';
import styles from './ExportPackModal.module.css';

export default function ContinueButton({ onClick, disabled = false }) {
  return (
    <Button
      className={styles.continueBtn}
      type="primary"
      onClick={() => onClick(s => s + 1)}
      disabled={disabled}
    >
      Continue
    </Button>
  );
}
