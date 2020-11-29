import React, { memo } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: center;
  border-radius: 5px;
  padding: 10px;
  margin: 0 10px;
  width: ${props => props.width && '132px'};
  height: ${props => props.height && '40px'};
  background: ${props => props.background && props.theme.palette.primary.main};
  cursor: pointer;
  &:hover {
  }
`;

const Button = ({ children, ...restProps }) => {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Container {...restProps}>{children}</Container>;
};

export default memo(Button);
