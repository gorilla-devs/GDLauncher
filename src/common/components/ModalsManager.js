import React, { useState, useEffect, lazy } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { closeModal } from '../reducers/modals/actions';
import AsyncComponent from './AsyncComponent';
import AddInstance from '../modals/AddInstance';
import Settings from '../modals/Settings';

const Overlay = styled.div`
  position: absolute;
  top: ${props => props.theme.sizes.height.systemNavbar}px;
  left: 0;
  bottom: 0;
  right: 0;
  backdrop-filter: blur(4px);
  will-change: opacity;
  transition: opacity 300ms cubic-bezier(0.165, 0.84, 0.44, 1);
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
  transition: transform 300ms;
  will-change: transform;
  transition-timing-function: cubic-bezier(0.165, 0.84, 0.44, 1);
  z-index: 1001;
`;

const modalsComponentLookupTable = {
  AddInstance,
  AccountsManager: AsyncComponent(
    lazy(() => import('../modals/AccountsManager'))
  ),
  Settings,
  Screenshot: AsyncComponent(lazy(() => import('../modals/Screenshot'))),
  InstanceDeleteConfirmation: AsyncComponent(
    lazy(() => import('../modals/InstanceDeleteConfirmation'))
  ),
  ActionConfirmation: AsyncComponent(
    lazy(() => import('../modals/ActionConfirmation'))
  ),
  DuplicateInstance: AsyncComponent(
    lazy(() => import('../modals/DuplicateInstance'))
  ),
  AddAccount: AsyncComponent(lazy(() => import('../modals/AddAccount'))),
  ModpackDescription: AsyncComponent(
    lazy(() => import('../modals/ModpackDescription'))
  ),
  InstanceManager: AsyncComponent(
    lazy(() => import('../modals/InstanceManager'))
  ),
  InstanceExportCurseForge: AsyncComponent(
    lazy(() => import('../modals/InstanceExport/CurseForge'))
  ),
  AutoUpdatesNotAvailable: AsyncComponent(
    lazy(() => import('../modals/AutoUpdatesNotAvailable'))
  ),
  BisectHosting: AsyncComponent(lazy(() => import('../modals/BisectHosting'))),
  Onboarding: AsyncComponent(lazy(() => import('../modals/Onboarding'))),
  ModOverview: AsyncComponent(lazy(() => import('../modals/ModOverview'))),
  ModChangelog: AsyncComponent(lazy(() => import('../modals/ModChangelog'))),
  ModsBrowser: AsyncComponent(lazy(() => import('../modals/ModsBrowser'))),
  JavaSetup: AsyncComponent(lazy(() => import('../modals/JavaSetup'))),
  ModsUpdater: AsyncComponent(lazy(() => import('../modals/ModsUpdater'))),
  InstanceCrashed: AsyncComponent(
    lazy(() => import('../modals/InstanceCrashed'))
  ),
  ChangeLogs: AsyncComponent(lazy(() => import('../modals/ChangeLogs'))),
  InstancesMigration: AsyncComponent(
    lazy(() => import('../modals/InstancesMigration'))
  ),
  McVersionChanger: AsyncComponent(
    lazy(() => import('../modals/McVersionChanger'))
  )
};

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
    <Overlay onMouseDown={back} style={bgStyle}>
      <Modal style={modalStyle}>{children}</Modal>
    </Overlay>
  );
};

const ModalsManager = () => {
  const currentModals = useSelector(state => state.modals);

  const renderedModals = currentModals.map(modalDescription => {
    const { modalType, modalProps = {}, unmounting = false } = modalDescription;
    const ModalComponent = modalsComponentLookupTable[modalType];

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

export default ModalsManager;
