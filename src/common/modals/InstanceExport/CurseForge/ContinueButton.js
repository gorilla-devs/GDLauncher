import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowAltRight } from '@fortawesome/free-solid-svg-icons';

export default function ContinueButton({ onClick, disabled = false }) {
  return (
    <div
      onClick={() => {
        if (!disabled) {
          onClick(s => s + 1);
        }
      }}
      disabled={disabled}
      css={`
        position: absolute;
        right: 20px;
        bottom: 20px;
        width: 70px;
        height: 40px;
        transition: 0.1s ease-in-out;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 4px;
        font-size: 40px;
        color: ${disabled
          ? props => props.theme.palette.text.disabled
          : props => props.theme.palette.text.icon};
        ${disabled ? '' : 'cursor: pointer;'}
        &:hover {
          background-color: ${disabled
            ? 'transparent'
            : props => props.theme.action.hover};
        }
      `}
    >
      <FontAwesomeIcon icon={faLongArrowAltRight} />
    </div>
  );
}
