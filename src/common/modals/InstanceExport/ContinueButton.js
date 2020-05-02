import React from 'react';
import { Button } from 'antd';

export default function ContinueButton({ onClick, disabled = false }) {
  return (
    <Button
      type="primary"
      onClick={() => onClick(s => s + 1)}
      disabled={disabled}
      css={`
        position: absolute;
        bottom: 20px;
        right: 20px;
      `}
    >
      Continue
    </Button>
  );
}
