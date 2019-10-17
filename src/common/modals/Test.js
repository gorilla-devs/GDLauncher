import React from "react";
import Button from "@material-ui/core/Button";
import Modal from "../components/Modal";

const Test = () => {
  return (
    <Modal
      height="400px"
      width="400px"
      css={`
        background: green;
      `}
    >
      <Button>Test</Button>
    </Modal>
  );
};

export default Test;
