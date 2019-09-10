import React, { Component } from "react";
import { connect } from "react-redux";
import Modal from '../Modal/Modal';
import { useDispatch } from 'react-redux';
import { history } from '../../../../app/store/configureStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose } from '@fortawesome/free-solid-svg-icons';
import { openModal, closeModal } from '../../../reducers/modals/actions';

export function TestModal(props) {
  const dispatch = useDispatch();

  const onNextModalClick = () => {
    const { counter } = props;

    dispatch(openModal("Modal1", { counter: !counter ? 1 : counter + 1 }));
  }

  const close = () => {
    dispatch(closeModal());
  }

  console.log("back", history)
  const { counter } = props;

  return (

    <Modal
      history={history}
      title={`PIPPO`}
      style={{ height: 300, width: 540 }}
      header="false"
      closeFunc={close}
      backBtn={
        <div >
          <FontAwesomeIcon icon={faWindowClose} onClick={close} />
        </div>
      }
    >
      <h1>TEST 1</h1>
      <p>THIS IS A TEST {props.counter}</p>
      <button onClick={onNextModalClick}>Add Another Modal</button>
      {/* <button onClick={close}>Add Another Modal</button> */}
    </ Modal>
  )

}


export default TestModal;