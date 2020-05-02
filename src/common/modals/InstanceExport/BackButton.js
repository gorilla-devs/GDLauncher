import React from 'react';
import { Button } from 'antd';

export default function BackButton({ onClick, disabled = false }) {
  return (
    <Button
      type="primary"
      onClick={() => onClick(s => s - 1)}
      disabled={disabled}
      css={`
        position: absolute;
        bottom: 20px;
        left: 20px;
      `}
    >
      Back
    </Button>
  );
}
