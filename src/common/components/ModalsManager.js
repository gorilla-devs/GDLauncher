import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
// import Settings from "components/modals/Settings";
// import Changelog from "components/modals/Changelog";
// import LoginHelper from "components/modals/LoginHelper";
import AddInstance from '../modals/AddInstance';
import Settings from '../modals/Settings/Settings';
import Screenshot from '../modals/Screenshot';
import InstanceDeleteConfirmation from '../modals/InstanceDeleteConfirmation';
import ActionConfirmation from '../modals/ActionConfirmation';
import AccountsManager from '../modals/AccountsManager';
import AddAccount from '../modals/AddAccount';
import InstanceManager from '../modals/InstanceManager';
import ModsBrowser from '../modals/ModsBrowser';
import ModpackDescription from '../modals/ModpackDescription';
import Onboarding from '../modals/Onboarding';
import ModOverview from '../modals/ModOverview';
import { closeModal } from '../reducers/modals/actions';

const Overlay = styled.div`
  position: absolute;
  top: ${props => props.theme.sizes.height.systemNavbar}px;
  left: 0;
  bottom: 0;
  right: 0;
  backdrop-filter: blur(4px);
  will-change: opacity;
  transition: opacity 220ms cubic-bezier(0.165, 0.84, 0.44, 1);
  z-index: 1000;
`;

const Modal = styled.div`
  position: absolute;
  height: 100%;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: transparent;
  transition: transform 220ms;
  will-change: transform;
  transition-timing-function: cubic-bezier(0.165, 0.84, 0.44, 1);
  z-index: 1001;
`;

const modalsComponentLookupTable = {
  // Changelog,
  // LoginHelper
  AddInstance,
  AccountsManager,
  Settings,
  Screenshot,
  InstanceDeleteConfirmation,
  ActionConfirmation,
  AddAccount,
  ModpackDescription,
  InstanceManager,
  Onboarding,
  ModOverview,
  ModsBrowser
};

const ModalContainer = ({ unmounting, children }) => {
  const [modalStyle, setModalStyle] = useState({
    transform: 'scale(0.8)',
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

  const back = e => {
    e.stopPropagation();
    dispatch(closeModal());
  };

  const unMountStyle = () => {
    // css for unmount animation
    setModalStyle({
      transform: 'scale(0.8)',
      opacity: 0
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
    <Overlay onClick={back} style={bgStyle}>
      <Modal style={modalStyle} onClick={back}>
        {children}
      </Modal>
    </Overlay>
  );
};

const ModalsManager = () => {
  const currentModals = useSelector(state => state.modals);

  const renderedModals = currentModals.map(modalDescription => {
    const { modalType, modalProps = {}, unmounting = false } = modalDescription;
    const ModalComponent = modalsComponentLookupTable[modalType];

    return (
      <ModalContainer unmounting={unmounting} key={modalType}>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <ModalComponent {...modalProps} />
      </ModalContainer>
    );
  });

  return renderedModals;
};

export default ModalsManager;
