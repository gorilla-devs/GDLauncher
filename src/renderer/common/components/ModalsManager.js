import React, { useState, useEffect, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { closeModal } from '../reducers/modals/actions';
import modals from './modals';

const Overlay = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(6px);
  will-change: opacity;
  transition: opacity 300ms cubic-bezier(0.165, 0.84, 0.44, 1);
  z-index: 1000;
`;

const Modal = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background: transparent;
  transition: transform 300ms;
  will-change: transform;
  transition-timing-function: cubic-bezier(0.165, 0.84, 0.44, 1);
  z-index: 1001;
`;

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
`;

const ModalContainer = ({ unmounting, children, preventClose, modalType }) => {
  const [modalStyle, setModalStyle] = useState({
    transform: `scale(${modalType === 'Settings' ? 2 : 0})`,
    opacity: 0
  });
  const [bgStyle, setBgStyle] = useState({
    background: 'rgba(0, 0, 0, 0.70)',
    opacity: 0
  });

  const dispatch = useDispatch();

  useEffect(() => {
    setTimeout(mountStyle, 0);
  }, []);

  useEffect(() => {
    if (unmounting) unMountStyle();
  }, [unmounting]);

  const back = () => {
    if (preventClose) {
      setModalStyle({
        animation: `modalShake 0.25s linear infinite`
      });

      setTimeout(() => {
        setModalStyle({
          transform: 'scale(1)'
        });
      }, 500);
      return;
    }
    dispatch(closeModal());
  };

  const unMountStyle = () => {
    // css for unmount animation
    setModalStyle({
      transform: `scale(${modalType === 'Settings' ? 2 : 0})`,
      opacity: 1
    });
    setBgStyle({
      background: 'rgba(0, 0, 0, 0.70)',
      opacity: 0
    });
  };

  const mountStyle = () => {
    // css for mount animation
    setModalStyle({
      transform: 'scale(1)',
      opacity: 1
    });

    setBgStyle({
      background: 'rgba(0, 0, 0, 0.70)',
      opacity: 1
    });
  };

  return (
    <Container>
      <Overlay onMouseDown={back} style={bgStyle} />
      <Modal style={modalStyle}>{children}</Modal>
    </Container>
  );
};

const ModalsManager = () => {
  const currentModals = useSelector(state => state.modals);

  const renderedModals = currentModals.map(modalDescription => {
    const { modalType, modalProps = {}, unmounting = false } = modalDescription;
    const ModalComponent = modals[modalType];

    return (
      <ModalContainer
        unmounting={unmounting}
        key={modalType}
        preventClose={modalProps.preventClose}
        modalType={modalType}
      >
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <ModalComponent {...modalProps} />
      </ModalContainer>
    );
  });

  return renderedModals;
};

export default memo(ModalsManager);
