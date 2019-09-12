import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { closeModal } from '../../reducers/modals/actions';
import Settings from '../Settings/Settings';
import InstanceCreatorModal from '../InstanceCreatorModal/InstanceCreatorModal';
import CurseModpacksBrowserCreatorModal from '../CurseModpacksBrowserCreatorModal/CurseModpacksBrowserCreatorModal';
import CurseModpackExplorerModal from '../CurseModpackExplorerModal/CurseModpackExplorerModal';
import InstanceManagerModal from '../InstanceManagerModal/InstanceManagerModal';
import ImportPack from '../ImportPack/ImportPack';
import ExportPackModal from '../ExportPackModal/ExportPackModal';
import LoginHelperModal from '../LoginHelperModal/LoginHelperModal';
import ChangelogsModal from '../ChangelogModal/ChangelogModal';
import ConfirmDeleteModal from '../ConfirmDeleteModal/ConfirmDeleteModal';
import JavaGlobalOptionsFixModal from '../JavaGlobalOptionsFixModal/JavaGlobalOptionsFixModal';

const Overlay = styled.div`
  position: absolute;
  top: 20px;
  left: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  right: 0;
  z-index: 10000;
`;

const Modal = styled.div`
  position: absolute;
  height: 90vh;
  width: 60vw;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  background: var(--secondary-color-1);
  border-radius: 2px;
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

const ModalContainer = ({ unmounting, children, style }) => {
  const [modalStyle, setModalStyle] = useState({
    display: 'block',
    transform: 'scale(0)',
    opacity: 0,
    transition: 'all 220ms',
    willChange: 'transform',
    transitionTimingFunction: 'cubic-bezier(0.165, 0.840, 0.440, 1.000)'
  });
  const [bgStyle, setBgStyle] = useState({
    background: 'rgba(0, 0, 0, 0.70)',
    backdropFilter: 'blur(4px)',
    transition: 'all 220ms cubic-bezier(0.165, 0.840, 0.440, 1.000)',
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
      display: 'block',
      transform: 'scale(0)',
      opacity: 0,
      transition: 'all 260ms',
      willChange: 'transform',
      transitionTimingFunction: 'cubic-bezier(0.165, 0.840, 0.440, 1.000)'
    });
    setBgStyle({
      backfaceVisibility: 'hidden',
      perspective: 1000,
      transform: 'translate3d(0, 0, 0) translateZ(0)',
      background: 'rgba(0, 0, 0, 0.70)',
      backdropFilter: 'blur(0px)',
      transition: 'all 260ms cubic-bezier(0.165, 0.840, 0.440, 1.000)',
      opacity: 0
    });
  };

  const mountStyle = () => {
    // css for mount animation
    setModalStyle({
      display: 'block',
      transform: 'scale(1)',
      opacity: 1,
      transition: 'all 220ms',
      willChange: 'transform',
      transitionTimingFunction: 'cubic-bezier(0.165, 0.840, 0.440, 1.000)'
    });

    setBgStyle({
      backfaceVisibility: 'hidden',
      perspective: 1000,
      transform: 'translate3d(0, 0, 0) translateZ(0)',
      backdropFilter: 'blur(4px)',
      background: 'rgba(0, 0, 0, 0.70)',
      transition: 'all 220ms cubic-bezier(0.165, 0.840, 0.440, 1.000)'
    });
  };

  return (
    <Overlay onClick={back} style={bgStyle}>
      <Modal
        style={{
          ...modalStyle,
          ...style
        }}
        onClick={e => e.stopPropagation()}
      >
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
      <ModalContainer unmounting={unmounting} style={modalProps.style}>
        <ModalComponent {...modalProps} key={modalType + index} />
      </ModalContainer>
    );
  });

  return <span>{renderedModals}</span>;
};

export default ModalsManager;
