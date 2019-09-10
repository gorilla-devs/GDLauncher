import React, { Component } from "react";
import { connect, useSelector } from "react-redux";

import Modal1 from "./ModalTest";

const modalComponentLookupTable = {
  Modal1
};


export function ModalManager(props) {
  const currentModals = useSelector(state => state.modals);


  const renderedModals = currentModals.map((modalDescription, index) => {
    const { modalType, modalProps = {} } = modalDescription;
    const ModalComponent = modalComponentLookupTable[modalType];

    return <ModalComponent {...modalProps} key={modalType + index} />;

  });


  return <span>{renderedModals}</span>

}

export default ModalManager;