import React from 'react';
import { Spin } from 'antd';
import { Transition } from 'react-transition-group';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled, { keyframes } from 'styled-components';
import { LoadingOutlined } from '@ant-design/icons';

const DragEnterEffect = styled.div`
  position: absolute;
  display: flex;
  flex-direction; column;
  justify-content: center;
  align-items: center;
  border: solid 5px ${props => props.theme.palette.primary.main};
  transition: opacity 0.2s ease-in-out;
  border-radius: 3px;
  width: 100%;
  height: 100%;
  margin-top: 3px;
  z-index: ${props =>
    props.transitionState !== 'entering' && props.transitionState !== 'entered'
      ? -1
      : 2};
  backdrop-filter: blur(4px);
  background: linear-gradient(
    0deg,
    rgba(0, 0, 0, .3) 40%,
    rgba(0, 0, 0, .3) 40%
  );
  opacity: ${({ transitionState }) =>
    transitionState === 'entering' || transitionState === 'entered' ? 1 : 0};
`;

const keyFrameMoveUpDown = keyframes`
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }

`;

const DragArrow = styled(FontAwesomeIcon)`
  ${props =>
    props.fileDrag ? props.theme.palette.primary.main : 'transparent'};

  color: ${props => props.theme.palette.primary.main};

  animation: ${keyFrameMoveUpDown} 1.5s linear infinite;
`;

const CopyTitle = styled.h1`
  font-weight: bold;
  ${props =>
    props.fileDrag ? props.theme.palette.primary.main : 'transparent'};

  color: ${props => props.theme.palette.primary.main};
  animation: ${keyFrameMoveUpDown} 1.5s linear infinite;
`;

const antIcon = (
  <LoadingOutlined
    css={`
      font-size: 24px;
    `}
    spin
  />
);

const DragnDrogEffect = ({
  onDrop,
  onDragLeave,
  onDragOver,
  fileDrag,
  fileDrop,
  numOfDraggedFiles
}) => {
  return (
    <>
      <Transition timeout={300} in={fileDrag}>
        {transitionState => (
          <DragEnterEffect
            onDrop={onDrop}
            transitionState={transitionState}
            onDragLeave={onDragLeave}
            fileDrag={fileDrag}
            onDragOver={onDragOver}
          >
            {fileDrop ? (
              <Spin
                indicator={antIcon}
                css={`
                  width: 30px;
                `}
              >
                {numOfDraggedFiles > 0 ? numOfDraggedFiles : 1}
              </Spin>
            ) : (
              <div
                css={`
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                `}
                onDragLeave={e => e.stopPropagation()}
              >
                <CopyTitle>Copy</CopyTitle>
                <DragArrow icon={faArrowDown} size="3x" />
              </div>
            )}
          </DragEnterEffect>
        )}
      </Transition>
    </>
  );
};

export default DragnDrogEffect;
