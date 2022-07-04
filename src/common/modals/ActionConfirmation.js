import React from 'react';
import { Button } from 'antd';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import Modal from '../components/Modal';
import { closeModal } from '../reducers/modals/actions';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  text-align: center;
  justify-content: space-between;
`;

const Buttons = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
`;

const applyChoice = async (
  choiceType,
  callback,
  fileName,
  dispatch,
  delay = 500
) => {
  if (choiceType === 'abort') {
    if (callback) {
      callback();
      setTimeout(() => dispatch(closeModal()), delay);
    } else dispatch(closeModal());
  } else {
    callback(fileName);
    setTimeout(() => dispatch(closeModal()), delay);
  }
};

export default function ActionConfirmation({
  confirmCallback,
  abortCallback = () => {},
  message,
  fileName,
  delay,
  title
}) {
  const dispatch = useDispatch();
  return (
    <Modal
      css={`
        height: 40%;
        width: 50%;
        max-width: 550px;
        max-height: 260px;
        overflow: hidden;
      `}
      title={title}
      closeCallback={abortCallback}
    >
      <Container>
        {message}
        <Buttons>
          <Button
            onClick={() => {
              applyChoice('abort', abortCallback, fileName, dispatch, delay);
            }}
          >
            Abort
          </Button>
          <Button
            onClick={() =>
              applyChoice('confirm', confirmCallback, fileName, dispatch, delay)
            }
          >
            Confirm
          </Button>
        </Buttons>
      </Container>
    </Modal>
  );
}
