import React from "react";
import Modal from "../components/Modal";

const Test = () => {
  return (
    <Modal
      height="400"
      width="400"
      css={`
        background: green;
      `}
    >
      Test
    </Modal>
  );
};

export default Test;
