import React, { memo } from 'react';
import styled from 'styled-components';

const StyledBanner = styled.div`
  width: 100%;
  height: 180px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  border-radius: ${props => props.theme.shape.borderRadius};
  background: ${props => props.color};
  color: white;
`;

const Title = styled.h1`
  color: ${props => props.theme.palette.text.primary};
  text-align: center;
  font-weight: 800;
  margin: 0;
`;

const SubTitle = styled.p`
  color: ${props => props.theme.palette.text.primary};
  text-align: center;
  max-width: 80%;
`;

const Banner = ({ color, title, children }) => {
  return (
    <StyledBanner color={color}>
      <Title>{title}</Title>
      <SubTitle>{children}</SubTitle>
    </StyledBanner>
  );
};

export default memo(Banner);
