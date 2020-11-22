import React, { memo } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWindowMinimize,
  faWindowRestore,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

const SystemNavbar = () => {
  return (
    <MainContainer>
      <WindowControls>
        <div
          css={`
            font-size: 18px;
            -webkit-app-region: no-drag;
          `}
        >
          <FontAwesomeIcon icon={faTimes} />
        </div>
        <div
          css={`
            -webkit-app-region: no-drag;
          `}
        >
          <FontAwesomeIcon icon={faWindowRestore} />
        </div>
        <div
          css={`
            -webkit-app-region: no-drag;
          `}
        >
          <FontAwesomeIcon icon={faWindowMinimize} />
        </div>
      </WindowControls>
    </MainContainer>
  );
};

export default memo(SystemNavbar);

const MainContainer = styled.div`
  width: 100%;
  height: ${({ theme }) => theme.sizes.height.systemNavbar}px;
  background: ${({ theme }) => theme.palette.grey[900]};
  -webkit-app-region: drag;
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 100000;
`;

const WindowControls = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  cursor: pointer;
  flex-direction: row-reverse;
  div {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 20px;
    &:hover {
      background: ${({ theme }) => theme.palette.grey[800]};
    }
    &:active {
      background: ${({ theme }) => theme.palette.grey[700]};
    }
  }
`;
