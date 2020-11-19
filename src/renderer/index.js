import React, { memo } from 'react';
import styled from 'styled-components';
import GlobalStyles from './common/GlobalStyles';
// eslint-disable-next-line
import Root from './_APP_TARGET_';

const RendererRoot = () => {
  return (
    <>
      <GlobalStyles />
      <Container>
        <Root />
      </Container>
    </>
  );
};

export default memo(RendererRoot);

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;
