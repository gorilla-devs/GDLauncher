import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { closeModal } from '../../reducers/modals/actions';
import Settings from '../../components/Settings/Settings';
import InstanceCreatorModal from '../../components/InstanceCreatorModal/InstanceCreatorModal';
import CurseModpacksBrowserCreatorModal from '../../components/CurseModpacksBrowserCreatorModal/CurseModpacksBrowserCreatorModal';
import CurseModpackExplorerModal from '../../components/CurseModpackExplorerModal/CurseModpackExplorerModal';
import InstanceManagerModal from '../../components/InstanceManagerModal/InstanceManagerModal';
import ImportPack from '../../components/ImportPack/ImportPack';
import ExportPackModal from '../../components/ExportPackModal/ExportPackModal';
import LoginHelperModal from '../../components/LoginHelperModal/LoginHelperModal';
import ChangelogsModal from '../../components/ChangelogModal/ChangelogModal';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal/ConfirmDeleteModal';
import JavaGlobalOptionsFixModal from '../../components/JavaGlobalOptionsFixModal/JavaGlobalOptionsFixModal';

const Overlay = styled.div`
  position: absolute;
  top: 20px;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 10000;
`;

const Modal = styled.div`
  position: absolute;
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: transparent;
`;

const modalsComponentLookupTable = {
  Settings,
  InstanceCreatorModal,
  CurseModpacksBrowserCreatorModal,
  CurseModpackExplorerModal,
  InstanceManagerModal,
  ImportPack,
  ExportPackModal,
  LoginHelperModal,
  ChangelogsModal,
  ConfirmDeleteModal,
  JavaGlobalOptionsFixModal
};

const ModalContainer = ({ unmounting, children }) => {
  const [modalStyle, setModalStyle] = useState({
    transform: 'scale(0.8)',
    opacity: 0,
    transition: 'all 200ms',
    willChange: 'transform',
    transitionTimingFunction: 'cubic-bezier(0.165, 0.840, 0.440, 1.000)'
  });
  const [bgStyle, setBgStyle] = useState({
    background: 'rgba(0, 0, 0, 0.70)',
    backdropFilter: 'blur(4px)',
    willChange: 'backdrop-filter',
    transition: 'all 200ms cubic-bezier(0.165, 0.840, 0.440, 1.000)',
    opacity: 0
  });

  const dispatch = useDispatch();

  useEffect(() => {
    mountStyle();
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
      opacity: 0,
      transition: 'all 220ms',
      willChange: 'transform',
      transitionTimingFunction: 'cubic-bezier(0.165, 0.840, 0.440, 1.000)'
    });
    setBgStyle({
      backfaceVisibility: 'hidden',
      perspective: 1000,
      transform: 'translate3d(0, 0, 0) translateZ(0)',
      background: 'rgba(0, 0, 0, 0.70)',
      willChange: 'backdrop-filter',
      backdropFilter: 'blur(0px)',
      transition: 'all 220ms cubic-bezier(0.165, 0.840, 0.440, 1.000)',
      opacity: 0
    });
  };

  const mountStyle = () => {
    // css for mount animation
    setModalStyle({
      transform: 'scale(1)',
      opacity: 1,
      transition: 'all 200ms',
      willChange: 'transform',
      transitionTimingFunction: 'cubic-bezier(0.165, 0.840, 0.440, 1.000)'
    });

    setBgStyle({
      backfaceVisibility: 'hidden',
      perspective: 1000,
      transform: 'translate3d(0, 0, 0) translateZ(0)',
      willChange: 'backdrop-filter',
      backdropFilter: 'blur(4px)',
      background: 'rgba(0, 0, 0, 0.70)',
      transition: 'all 200ms cubic-bezier(0.165, 0.840, 0.440, 1.000)'
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

const ModalsManager = props => {
  const currentModals = useSelector(state => state.modals);

  const renderedModals = currentModals.map((modalDescription, index) => {
    const { modalType, modalProps = {}, unmounting = false } = modalDescription;
    const ModalComponent = modalsComponentLookupTable[modalType];

    return (
      <ModalContainer unmounting={unmounting}>
        <ModalComponent {...modalProps} key={modalType + index} />
      </ModalContainer>
    );
  });

  return <span>{renderedModals}</span>;
};

export default ModalsManager;
