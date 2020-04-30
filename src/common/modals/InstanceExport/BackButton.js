import React from 'react';
import { Button } from 'antd';
import styles from './ExportPackModal.module.css';

export default function BackButton({ onClick }) {
  return (
    <Button
      className={styles.backBtn}
      type="primary"
      onClick={() => onClick(s => s - 1)}
    >
      Back
    </Button>
  );
}
