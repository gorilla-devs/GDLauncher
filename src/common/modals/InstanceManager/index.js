/* eslint-disable */
import React, { useState } from "react";
import Modal from "../../components/Modal";

import Content from "./Content";

const InstanceManager = () => {
  const [page, setPage] = useState(0);

  return (
    <Modal
      css={`
        height: 85%;
        width: 85%;
        max-width: 1500px;
      `}
      title="Instance Manager"
    >
      <Content page={page} setPage={setPage} />
    </Modal>
  );
};

export default React.memo(InstanceManager);
