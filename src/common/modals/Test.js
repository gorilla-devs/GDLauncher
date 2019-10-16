import React from "react";
import Modal from "../components/Modal";
import Button from "@material-ui/core/Button";

const Test = () => {
  return (
    <Modal
      height="400"
      width="400"
      css={`
        background: green;
      `}
    >
      <Button>Test</Button>
    </Modal>
  );
};

export default Test;
