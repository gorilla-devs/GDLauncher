// @flow
import React, { Component } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose } from '@fortawesome/free-solid-svg-icons';
import { closeModal } from 'reducers/modals/actions';

const Header = styled.div`
  position: relative;
  width: 100%;
  height: 30px;
  line-height: 30px;
  padding-left: 10px;
  background: var(--secondary-color-2);
  border-radius: 4px;
`;

const CloseButton = styled.div`
  float: right;
  position: relative;
  top: 2px;
  right: 10px;
  font-size: 19px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  &:hover {
    color: rgba(231, 76, 60, 0.8);
  }
`;

type Props = {
  history: any,
  style: {},
  header: boolean,
  title: string,
  backBtn: React.ReactNode,
  children: React.ReactNode
};

const Modal = ({
  transparentBackground,
  height,
  width,
  header,
  title,
  backBtn,
  children
}) => {
  const dispatch = useDispatch();
  return (
    <div
      onClick={e => e.stopPropagation()}
      transparentBackground={transparentBackground}
      height={height}
      width={width}
      css={`
        background: ${props =>
          props.transparentBackground
            ? 'transparent'
            : 'var(--secondary-color-1)'};
        position: relative;
        border-radius: 4;
        height: ${props => props.height || 'auto'};
        width: ${props => props.width || 'auto'};
      `}
    >
      {(header === undefined || header === true) && (
        <Header>
          <h3
            css={`
              display: inline-block;
            `}
          >
            {title || 'Modal'}
          </h3>
          <CloseButton onClick={() => dispatch(closeModal())}>
            <FontAwesomeIcon icon={faWindowClose} />
          </CloseButton>
        </Header>
      )}
      <div
        header={header}
        css={`
          height: ${header === undefined || header === true
            ? 'calc(100% - 30px)'
            : '100%'};
        `}
      >
        <span onClick={() => dispatch(closeModal())}>
          {backBtn !== undefined && backBtn}
        </span>
        {children}
      </div>
    </div>
  );
};

export default Modal;
