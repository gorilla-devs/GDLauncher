// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose } from '@fortawesome/free-solid-svg-icons';
import { closeModal } from 'reducers/modals/actions';
import styles from './Modal.scss';

type Props = {
  history: any,
  style: {},
  header: boolean,
  title: string,
  backBtn: React.ReactNode,
  children: React.ReactNode
};

const Modal = props => {
  render() {
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
          <div className={styles.header}>
            <h3 style={{ display: 'inline-block' }}>
              {props.title || 'Modal'}
            </h3>
            <div
              className={styles.closeBtn}
              onClick={() => props.closeModal()}
            >
              <FontAwesomeIcon icon={faWindowClose} />
            </div>
          </div>
        )}
        <div
          className={styles.modalContent}
          style={{
            height:
              props.header === undefined || props.header === true
                ? 'calc(100% - 30px)'
                : '100%'
          }}
        >
          <span onClick={() => props.closeModal()}>
            {props.backBtn !== undefined && props.backBtn}
          </span>
          {props.children}
        </div>
      </div>
    );
  }
}

export default Modal;
