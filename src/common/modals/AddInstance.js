import React from "react";
import Button from "@material-ui/core/Button";
import Modal from "../components/Modal";

const AddInstance = () => {
  return (
    <Modal
      css={`
        height: 70%;
        width: 70%;
        max-width: 1500px;
      `}
    >
      <Button>Test</Button>
    </Modal>
  );
};

export default AddInstance;
