import React, { Component } from "react";
import { connect } from "react-redux";

import Modal from "../Modal/Modal";

const modalComponentLookupTable = {
  Modal
};

const mapState = (state) => ({ currentModals: state.modals });


export function ModalManager(props) {

  const { currentModals } = props;


  const renderedModals = currentModals.map((modalDescription, index) => {
    const { modalType, modalProps = {} } = modalDescription;
    const ModalComponent = modalComponentLookupTable[modalType];

    return <ModalComponent {...modalProps} key={modalType + index} />;

  });


  return <span>{renderedModals}</span>

}

export default connect(mapState)(ModalManager);