import React, { memo } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  /* display: flex;
  justify-content: center;
  align-items: center; */
  width: 100%;
  height: 100vh;
  text-align: center;
  background: ${props => props.theme.palette.grey[800]};
`;

const FirstView = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  text-align: center;
`;

const Home = () => {
  return (
    <Container>
      <FirstView>
        <div
          css={`
            display: flex;
            flex-direction: column;
            justify-items: center;
            align-items: center;
            h1 {
              margin: 17px;
            }
          `}
        >
          <h1
            css={`
              font-weight: 900;
              font-size: 96px;
              line-height: 116px;
              height: 102px;
            `}
          >
            GDLauncher
          </h1>
          <h2
            css={`
              font-weight: normal;
              font-size: 48px;
              line-height: 58px;
              width: 540px;
            `}
          >
            The future of minecraft launchers
          </h2>
        </div>
      </FirstView>
    </Container>
  );
};

export default memo(Home);
