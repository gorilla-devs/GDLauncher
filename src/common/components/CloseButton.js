import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose } from '@fortawesome/free-solid-svg-icons';

const CloseButton = props => {
  return (
    // eslint-disable-next-line
    <CloseIcon {...props}>
      <FontAwesomeIcon icon={faWindowClose} />
    </CloseIcon>
  );
};

export default CloseButton;

const CloseIcon = styled.div`
  font-size: 20px;
  width: 20px;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  &:hover {
    color: ${props => props.theme.palette.error.main};
  }
`;
