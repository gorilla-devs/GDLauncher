import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
// import Settings from "components/modals/Settings";
// import Changelog from "components/modals/Changelog";
// import LoginHelper from "components/modals/LoginHelper";
import Test from "../modals/Test";
import { closeModal } from "../reducers/modals/actions";

const Overlay = styled.div`
  position: absolute;
  top: 0;
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
  // Settings,
  // Changelog,
  // LoginHelper
  Test
};

const ModalContainer = ({ unmounting, children }) => {
  const [modalStyle, setModalStyle] = useState({
    transform: "scale(0.8)",
    opacity: 0,
    transition: "transform 200ms, opacity 200ms",
    willChange: "transform, opacity",
    transitionTimingFunction: "cubic-bezier(0.165, 0.840, 0.440, 1.000)"
  });
  const [bgStyle, setBgStyle] = useState({
    background: "rgba(0, 0, 0, 0.70)",
    backdropFilter: "blur(4px)",
    willChange: "opacity",
    transition: "opacity 200ms cubic-bezier(0.165, 0.840, 0.440, 1.000)",
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
      transform: "scale(0.8)",
      opacity: 0,
      transition: "transform 220ms, opacity 220ms",
      willChange: "transform, opacity",
      transitionTimingFunction: "cubic-bezier(0.165, 0.840, 0.440, 1.000)"
    });
    setBgStyle({
      background: "rgba(0, 0, 0, 0.70)",
      willChange: "opacity",
      backdropFilter: "blur(4px)",
      transition: "opacity 220ms cubic-bezier(0.165, 0.840, 0.440, 1.000)",
      opacity: 0
    });
  };

  const mountStyle = () => {
    // css for mount animation
    setModalStyle({
      transform: "scale(1)",
      opacity: 1,
      transition: "transform 200ms, opacity: 200ms",
      willChange: "transform, opacity",
      transitionTimingFunction: "cubic-bezier(0.165, 0.840, 0.440, 1.000)"
    });

    setBgStyle({
      willChange: "opacity",
      backdropFilter: "blur(4px)",
      background: "rgba(0, 0, 0, 0.70)",
      transition: "opacity 200ms cubic-bezier(0.165, 0.840, 0.440, 1.000)"
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
