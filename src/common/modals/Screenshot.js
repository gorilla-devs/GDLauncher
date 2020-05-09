import React from 'react';
import path from 'path';
import styled from 'styled-components';
import Modal from '../components/Modal';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  text-align: center;
`;

const Img = styled.img`
  width: 100%;
  height: 100%;
`;

export default function Screenshot({ screenshotsPath, file }) {
  const image = `file:///${path.join(screenshotsPath, file.name)}`;

  return (
    <Modal
      css={`
        height: 85%;
        width: 85%;
        max-width: 1500px;
        overflow: hidden;
      `}
      title="ScreenShot"
    >
      <Container>
        <Img src={image} />
      </Container>
    </Modal>
  );
}
