// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
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

const Modal = props => {
  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        background: props.transparentBackground
          ? 'transparent'
          : 'var(--secondary-color-1)',
        position: 'relative',
        borderRadius: 4,
        ...props.style
      }}
    >
      {(props.header === undefined || props.header === true) && (
        <Header>
          <h3
            css={`
              display: inline-block;
            `}
          >
            {props.title || 'Modal'}
          </h3>
          <CloseButton onClick={() => props.closeModal()}>
            <FontAwesomeIcon icon={faWindowClose} />
          </CloseButton>
        </Header>
      )}
      <div
        header={header}
        css={`
          height: ${props.header === undefined || props.header === true
            ? 'calc(100% - 30px)'
            : '100%'};
        `}
      >
        <span onClick={() => props.closeModal()}>
          {props.backBtn !== undefined && props.backBtn}
        </span>
        {props.children}
      </div>
    </div>
  );
};

export default Modal;
