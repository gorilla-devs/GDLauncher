import React, { memo } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  text-align: center;
  background: ${props => props.theme.palette.grey[800]};
`;

const Profile = () => {
  return <Container>Profile</Container>;
};

export default memo(Profile);
