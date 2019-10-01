import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Modal from 'components/Common/Modal';

const Container = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  text-align: center;
  padding: 0 30px;
`;

export default props => {
  return (
    <Modal header={false} height="100%" width="100%">
      <Container>Test</Container>
    </Modal>
  );
};
