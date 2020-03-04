import React from "react";
import { Button } from "antd";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import Modal from "../components/Modal";
import { closeModal } from "../reducers/modals/actions";

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

const applyChoise = async (
  choiseType,
  func,
  fileName,
  dispatch,
  delay = 500
) => {
  if (choiseType === "abort") {
    if (func) {
      func();
      setTimeout(() => dispatch(closeModal()), delay);
    } else dispatch(closeModal());
  } else {
    func(fileName);
    setTimeout(() => dispatch(closeModal()), delay);
  }
};

export default function ConfirmationModal({
  message,
  confirmCallback,
  fileName,
  abortCallback,
  delay
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
      title="Confirm"
    >
      <Container>
        {message}
        <Buttons>
          <Button
            onClick={() => {
              applyChoise("abort", abortCallback, fileName, dispatch, delay);
            }}
          >
            Abort
          </Button>
          <Button
            onClick={() =>
              applyChoise("confirm", confirmCallback, fileName, dispatch, delay)
            }
          >
            Confirm
          </Button>
        </Buttons>
      </Container>
    </Modal>
  );
}
