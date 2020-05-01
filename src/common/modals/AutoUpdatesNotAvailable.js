import React, { memo } from 'react';
import styled from 'styled-components';
import Modal from '../components/Modal';

const AutoUpdatesNotAvailable = () => {
  return (
    <Modal
      css={`
        height: 200px;
        width: 400px;
      `}
      title="Auto Updates Not Available"
    >
      <Container>
        <div>Auto updates are not available on this platform.</div>
        <div
          css={`
            margin-top: 20px;
          `}
        >
          Please, update GDLauncher through your package manager or download the
          new version from our website <a href="https://gdevs.io">here</a>
        </div>
      </Container>
    </Modal>
  );
};

export default memo(AutoUpdatesNotAvailable);

const Container = styled.div`
  width: 100%;
  height: 100%;
  text-align: center;
  color: ${props => props.theme.palette.text.primary};
`;
