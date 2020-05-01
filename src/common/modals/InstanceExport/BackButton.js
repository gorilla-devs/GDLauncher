import React from 'react';
import { Button } from 'antd';
import styles from './ExportPackModal.module.css';

export default function BackButton({ onClick, disabled = false }) {
  return (
    <Button
      className={styles.backBtn}
      type="primary"
      onClick={() => onClick(s => s - 1)}
      disabled={disabled}
    >
      Back
    </Button>
  );
}
