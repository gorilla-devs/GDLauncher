import React, { memo } from 'react';
import styled from 'styled-components';
// import { useLocation } from 'react-router-dom';
import sadGd from 'src/common/assets/sadGd.png';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  text-align: center;
  background: ${props => props.theme.palette.grey[800]};
`;
const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  h2 {
    font-size: 30px;
    width: 100%;
    max-width: 400px;
  }
`;

const NoMatchImage = styled.img`
  width: 300px;
  height: 300px;
  margin-bottom: 50px;
`;

const NoMatch = () => {
  //   const location = useLocation();

  return (
    <Container>
      <InnerContainer>
        <NoMatchImage src={sadGd} alt="sadgd" />
        <h2>The page you were looking for doesn&apos;t exist</h2>
      </InnerContainer>
    </Container>
  );
};

export default memo(NoMatch);
